from flask import Flask, render_template, request, jsonify, session, redirect
import json
import re
import os
from datetime import datetime
from career_advisor import AIGrowthCompanion
from communication_coach import CommunicationCoach

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY',
                                'dev-key-change-in-production')

# Sample dataset for internships
INTERNSHIPS = [{
    "id": 1,
    "title": "Software Engineering Intern",
    "company": "TechCorp",
    "location": "San Francisco, CA",
    "description":
    "Work on full-stack web development projects using Python, JavaScript, and React",
    "required_skills": ["Python", "JavaScript", "React", "Git"],
    "preferred_degree": ["Computer Science", "Software Engineering"],
    "experience_level": "entry",
    "duration": "3 months",
    "stipend": "$2500/month"
}, {
    "id":
    2,
    "title":
    "Data Science Intern",
    "company":
    "DataFlow Analytics",
    "location":
    "New York, NY",
    "description":
    "Analyze large datasets and build machine learning models for business insights",
    "required_skills": ["Python", "Machine Learning", "SQL", "Statistics"],
    "preferred_degree":
    ["Data Science", "Statistics", "Computer Science", "Mathematics"],
    "experience_level":
    "intermediate",
    "duration":
    "4 months",
    "stipend":
    "$3000/month"
}, {
    "id":
    3,
    "title":
    "Marketing Analytics Intern",
    "company":
    "BrandBoost",
    "location":
    "Chicago, IL",
    "description":
    "Support marketing campaigns with data analysis and performance tracking",
    "required_skills": ["Excel", "Analytics", "Communication", "Marketing"],
    "preferred_degree": ["Marketing", "Business", "Economics"],
    "experience_level":
    "entry",
    "duration":
    "3 months",
    "stipend":
    "$2000/month"
}, {
    "id":
    4,
    "title":
    "UX Design Intern",
    "company":
    "DesignStudio",
    "location":
    "Austin, TX",
    "description":
    "Create user-centered designs and conduct usability testing",
    "required_skills":
    ["Design Thinking", "Figma", "User Research", "Prototyping"],
    "preferred_degree": ["Design", "Psychology", "Human-Computer Interaction"],
    "experience_level":
    "entry",
    "duration":
    "4 months",
    "stipend":
    "$2200/month"
}, {
    "id":
    5,
    "title":
    "Cybersecurity Intern",
    "company":
    "SecureNet",
    "location":
    "Washington, DC",
    "description":
    "Assist in threat analysis and security protocol implementation",
    "required_skills":
    ["Network Security", "Python", "Risk Assessment", "Linux"],
    "preferred_degree":
    ["Cybersecurity", "Computer Science", "Information Technology"],
    "experience_level":
    "intermediate",
    "duration":
    "6 months",
    "stipend":
    "$2800/month"
}, {
    "id":
    6,
    "title":
    "Finance Intern",
    "company":
    "InvestPro",
    "location":
    "Boston, MA",
    "description":
    "Support financial analysis and investment research",
    "required_skills":
    ["Financial Analysis", "Excel", "Research", "Communication"],
    "preferred_degree": ["Finance", "Economics", "Business", "Accounting"],
    "experience_level":
    "entry",
    "duration":
    "3 months",
    "stipend":
    "$2600/month"
}]

# Sample dataset for degree suggestions
DEGREE_SUGGESTIONS = {
    "Software Engineering": [{
        "degree":
        "Master's in Computer Science",
        "reason":
        "Advanced programming skills and system design knowledge"
    }, {
        "degree":
        "Certification in Cloud Computing",
        "reason":
        "High demand for cloud expertise in tech companies"
    }, {
        "degree":
        "Data Structures and Algorithms Bootcamp",
        "reason":
        "Essential for technical interviews at top tech companies"
    }],
    "Data Science": [{
        "degree":
        "Master's in Data Science",
        "reason":
        "Deep expertise in advanced analytics and machine learning"
    }, {
        "degree":
        "Statistics and Probability Certification",
        "reason":
        "Strong foundation for data interpretation and model validation"
    }, {
        "degree":
        "Big Data Technologies Course",
        "reason":
        "Skills in Hadoop, Spark, and distributed computing"
    }],
    "Marketing": [{
        "degree": "Digital Marketing Certification",
        "reason": "Modern marketing requires digital expertise"
    }, {
        "degree":
        "Master's in Business Administration (MBA)",
        "reason":
        "Leadership skills and strategic thinking for senior roles"
    }, {
        "degree":
        "Data Analytics for Marketing Certificate",
        "reason":
        "Data-driven decision making is crucial in modern marketing"
    }],
    "Design": [{
        "degree":
        "Master's in Human-Computer Interaction",
        "reason":
        "Advanced understanding of user behavior and interface design"
    }, {
        "degree": "Frontend Development Bootcamp",
        "reason": "Technical skills to implement your designs"
    }, {
        "degree":
        "Design Thinking Certification",
        "reason":
        "Structured approach to problem-solving and innovation"
    }],
    "Cybersecurity": [{
        "degree":
        "Master's in Cybersecurity",
        "reason":
        "Advanced knowledge of security protocols and threat analysis"
    }, {
        "degree":
        "Certified Information Security Manager (CISM)",
        "reason":
        "Industry-recognized certification for security management"
    }, {
        "degree":
        "Ethical Hacking Certification",
        "reason":
        "Hands-on skills in identifying and preventing security vulnerabilities"
    }],
    "Finance": [{
        "degree":
        "Master's in Finance (MFin)",
        "reason":
        "Advanced financial modeling and investment strategies"
    }, {
        "degree":
        "Chartered Financial Analyst (CFA)",
        "reason":
        "Gold standard certification for investment professionals"
    }, {
        "degree":
        "Financial Technology (FinTech) Certificate",
        "reason":
        "Skills in emerging financial technologies and blockchain"
    }]
}


class InternshipMatcher:

    def __init__(self):
        self.user_profile = {}

    def calculate_match_score(self, user_profile, internship):
        """Calculate how well a user matches an internship (0-100 score)"""
        score = 0

        # Degree match (30 points)
        if user_profile.get('degree', '').lower() in [
                d.lower() for d in internship['preferred_degree']
        ]:
            score += 30
        elif any(keyword in user_profile.get('degree', '').lower()
                 for keyword in ['computer', 'engineering', 'science']):
            if any(keyword in ' '.join(internship['preferred_degree']).lower()
                   for keyword in ['computer', 'engineering', 'science']):
                score += 15

        # Skills match (40 points)
        user_skills = [
            skill.lower().strip()
            for skill in user_profile.get('skills', '').split(',')
        ]
        required_skills = [
            skill.lower() for skill in internship['required_skills']
        ]

        matching_skills = sum(1 for skill in user_skills
                              if any(req_skill in skill or skill in req_skill
                                     for req_skill in required_skills))
        skill_score = min(40, (matching_skills / len(required_skills)) * 40)
        score += skill_score

        # Experience level match (20 points)
        user_exp = user_profile.get('experience_level', 'entry').lower()
        internship_exp = internship['experience_level'].lower()

        if user_exp == internship_exp:
            score += 20
        elif (user_exp == 'intermediate' and internship_exp == 'entry') or \
             (user_exp == 'advanced' and internship_exp in ['entry', 'intermediate']):
            score += 15

        # Interest/goal alignment (10 points)
        user_interests = user_profile.get('career_goals', '').lower()
        if any(word in user_interests
               for word in internship['title'].lower().split()):
            score += 10

        return min(100, score)

    def get_recommendations(self, user_profile):
        """Get internship recommendations for a user"""
        scored_internships = []

        for internship in INTERNSHIPS:
            score = self.calculate_match_score(user_profile, internship)
            if score > 20:  # Only recommend if score is above 20%
                scored_internships.append({
                    'internship': internship,
                    'match_score': score
                })

        # Sort by match score (highest first)
        scored_internships.sort(key=lambda x: x['match_score'], reverse=True)
        return scored_internships[:5]  # Return top 5 matches


matcher = InternshipMatcher()
career_companion = AIGrowthCompanion()
communication_coach = CommunicationCoach()


@app.route('/')
def home():
    return render_template('landing.html')


@app.route('/login')
def login():
    return render_template('landing.html')


@app.route('/dashboard')
def dashboard():
    # Check if user is logged in
    if 'user_email' not in session:
        return redirect('/')
    return render_template('dashboard.html')


@app.route('/api/login', methods=['POST'])
def handle_login():
    """Handle user login from landing page"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip()
        role = data.get('role', '')

        if not email or not role:
            return jsonify({
                'success': False,
                'error': 'Email and role are required'
            })

        # Store user info in session - this integrates with MENTORA dashboard
        session['user_email'] = email
        session['user_role'] = role
        session['user_name'] = email.split('@')[0] if '@' in email else email

        # Initialize user progress if not exists
        if 'user_xp' not in session:
            session['user_xp'] = 10  # Welcome bonus XP

        # Add login achievement to activity history
        if 'activity_history' not in session:
            session['activity_history'] = []

        session['activity_history'].insert(
            0, {
                'title': 'Welcome to MENTORA!',
                'description': f'Joined as a {role.title()}',
                'xp': 10,
                'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            })

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': {
                'email': email,
                'role': role,
                'name': session['user_name']
            }
        })

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Login failed. Please try again.'
        })


@app.route('/api/submit-profile', methods=['POST'])
def submit_profile():
    """Handle user profile submission and return internship recommendations"""
    data = request.get_json()

    # Store user profile in session
    session['user_profile'] = data

    # Get internship recommendations
    recommendations = matcher.get_recommendations(data)

    # Get degree suggestions based on user's field of interest
    degree_field = data.get('degree', '').lower()
    suggested_degrees = []

    for field, suggestions in DEGREE_SUGGESTIONS.items():
        if field.lower() in degree_field or any(
                keyword in degree_field for keyword in field.lower().split()):
            suggested_degrees = suggestions
            break

    # If no specific match, provide general suggestions based on career goals
    if not suggested_degrees:
        career_goals = data.get('career_goals', '').lower()
        if 'tech' in career_goals or 'software' in career_goals or 'programming' in career_goals:
            suggested_degrees = DEGREE_SUGGESTIONS['Software Engineering']
        elif 'data' in career_goals or 'analytics' in career_goals:
            suggested_degrees = DEGREE_SUGGESTIONS['Data Science']
        elif 'marketing' in career_goals or 'business' in career_goals:
            suggested_degrees = DEGREE_SUGGESTIONS['Marketing']
        elif 'design' in career_goals or 'ui' in career_goals or 'ux' in career_goals:
            suggested_degrees = DEGREE_SUGGESTIONS['Design']
        elif 'security' in career_goals or 'cyber' in career_goals:
            suggested_degrees = DEGREE_SUGGESTIONS['Cybersecurity']
        elif 'finance' in career_goals or 'investment' in career_goals:
            suggested_degrees = DEGREE_SUGGESTIONS['Finance']

    return jsonify({
        'success': True,
        'recommendations': recommendations,
        'degree_suggestions': suggested_degrees,
        'user_name': data.get('name', 'User')
    })


@app.route('/api/chat', methods=['POST'])
def chat():
    """Enhanced chat with AI Growth Companion - Professional Career Guidance"""
    data = request.get_json()
    message = data.get('message', '')
    user_profile = session.get('user_profile', {})

    # Handle specific traditional requests first
    if 'more internships' in message.lower(
    ) or 'other opportunities' in message.lower():
        # Show all internships with scores
        all_recommendations = []
        for internship in INTERNSHIPS:
            score = matcher.calculate_match_score(user_profile, internship)
            all_recommendations.append({
                'internship': internship,
                'match_score': score
            })
        all_recommendations.sort(key=lambda x: x['match_score'], reverse=True)

        return jsonify({
            'response':
            f"Here are all available internships ranked by how well they match your profile:",
            'recommendations': all_recommendations
        })

    # Handle interview practice scenarios
    elif 'interview' in message.lower() and ('practice' in message.lower()
                                             or 'mock' in message.lower()
                                             or 'feedback' in message.lower()):
        if 'technical' in message.lower():
            interview_type = "Technical Interview"
        elif 'behavioral' in message.lower():
            interview_type = "Behavioral Interview"
        else:
            interview_type = "General Interview"

        # Extract user's response if provided
        user_response = ""
        if '"' in message:
            # Extract quoted text as the user's answer
            quotes = message.split('"')
            if len(quotes) >= 2:
                user_response = quotes[1]

        if user_response:
            response = career_companion.provide_interview_feedback(
                user_profile, interview_type, user_response)
        else:
            response = f"""
I'm your AI Growth Companion, ready to help you excel in interviews!

**MOCK INTERVIEW PRACTICE AVAILABLE:**

1. **Technical Interviews** - Practice coding problems, system design, and technical concepts
2. **Behavioral Interviews** - Work on STAR method responses and leadership scenarios
3. **Industry-Specific Interviews** - Tailored questions for your field

**HOW TO GET FEEDBACK:**
• Type your question and your answer in quotes
• Example: "Tell me about yourself" "I am a computer science student..."
• I'll provide detailed feedback and improvement suggestions

What type of interview would you like to practice?
"""

        return jsonify({'response': response})

    # Handle networking requests
    elif 'network' in message.lower() or 'linkedin' in message.lower(
    ) or 'connect' in message.lower():
        industry_focus = user_profile.get(
            'career_goals', user_profile.get('degree', 'General'))
        response = career_companion.suggest_networking_strategy(
            user_profile, industry_focus)
        return jsonify({'response': response})

    # Handle career trajectory analysis
    elif 'career path' in message.lower() or 'trajectory' in message.lower(
    ) or 'career plan' in message.lower():
        response = career_companion.analyze_career_trajectory(user_profile)
        return jsonify({'response': response})

    # Handle general career guidance with AI Growth Companion
    else:
        response = career_companion.get_career_guidance(user_profile, message)
        return jsonify({'response': response})


@app.route('/api/communication/scenarios', methods=['GET'])
def get_communication_scenarios():
    """Get available communication scenarios"""
    try:
        scenarios = communication_coach.get_available_scenarios()
        return jsonify({'success': True, 'scenarios': scenarios})
    except Exception as e:
        print(f"Scenarios error: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to load scenarios'})


@app.route('/api/communication/start', methods=['POST'])
def start_communication_scenario():
    """Start a new communication scenario"""
    try:
        data = request.get_json()
        scenario_type = data.get('scenario_type', '')
        user_name = data.get('user_name', 'Student')

        if not scenario_type:
            return jsonify({
                'success': False,
                'error': 'No scenario type provided'
            })

        # Start scenario
        result = communication_coach.start_scenario(scenario_type, user_name,
                                                    session)

        return jsonify({'success': True, **result})

    except Exception as e:
        print(f"Start scenario error: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to start scenario'})


@app.route('/api/communication/respond', methods=['POST'])
def respond_to_communication_scenario():
    """Handle user response in communication scenario"""
    try:
        data = request.get_json()
        user_response = data.get('user_response', '')

        if not user_response:
            return jsonify({'success': False, 'error': 'No response provided'})

        # Process user response
        result = communication_coach.continue_scenario(user_response, session)

        return jsonify({'success': True, **result})

    except Exception as e:
        print(f"Communication response error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to process response'
        })


@app.route('/api/communication/tip', methods=['GET'])
def get_communication_tip():
    """Get a quick communication tip"""
    try:
        topic = request.args.get('topic', None)
        tip = communication_coach.get_quick_tip(topic)

        return jsonify({'success': True, 'tip': tip})

    except Exception as e:
        print(f"Tip error: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to get tip'})


@app.route('/api/communication/progress', methods=['GET'])
def get_communication_progress():
    """Get user's communication progress"""
    try:
        progress = communication_coach.get_user_progress(session)
        return jsonify({'success': True, **progress})
    except Exception as e:
        return jsonify({'success': False, 'error': 'Failed to get progress'})


@app.route('/api/communication/tone-analysis', methods=['POST'])
def analyze_tone():
    """Analyze tone of user's text"""
    try:
        data = request.get_json()
        text = data.get('text', '')

        if not text:
            return jsonify({'success': False, 'error': 'No text provided'})

        analysis = communication_coach.get_tone_analysis(text)
        return jsonify({'success': True, 'analysis': analysis})
    except Exception as e:
        return jsonify({'success': False, 'error': 'Failed to analyze tone'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
