import os
from google import genai
from google.genai import types

# IMPORTANT: KEEP THIS COMMENT - Using python_gemini integration
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

class AIGrowthCompanion:
    def __init__(self):
        self.model = "gemini-2.5-flash"
       
    def get_career_guidance(self, user_profile, message):
        """Provide personalized career guidance using Gemini AI"""
        try:
            # Build context from user profile
            profile_context = self._build_profile_context(user_profile)
           
            system_prompt = f"""You are an expert AI Growth Companion specializing in career development.
            Provide personalized, actionable career advice based on the user's profile and current question.
           
            User Profile Context:
            {profile_context}
           
            Guidelines:
            - Be supportive, professional, and encouraging
            - Provide specific, actionable advice
            - Reference their profile when relevant
            - Keep responses concise but helpful
            - Focus on growth opportunities and next steps
            """
           
            full_prompt = f"{system_prompt}\n\nUser Question: {message}"
           
            response = client.models.generate_content(
                model=self.model,
                contents=full_prompt
            )
           
            return response.text or "I'm here to help with your career growth! Could you please rephrase your question?"
           
        except Exception as e:
            return f"I apologize, but I'm experiencing technical difficulties. Please try again. Error: {str(e)}"
   
    def provide_interview_feedback(self, user_profile, interview_type, user_response):
        """Provide detailed interview feedback"""
        try:
            profile_context = self._build_profile_context(user_profile)
           
            system_prompt = f"""You are an expert interview coach providing detailed feedback on interview responses.
           
            Interview Type: {interview_type}
            User Profile: {profile_context}
           
            Analyze the user's response and provide:
            1. Strengths in their answer
            2. Areas for improvement
            3. Specific suggestions for enhancement
            4. A sample improved response
           
            Be constructive and encouraging while being honest about areas needing work.
            """
           
            full_prompt = f"{system_prompt}\n\nUser's Response: {user_response}"
           
            response = client.models.generate_content(
                model=self.model,
                contents=full_prompt
            )
           
            return response.text or "I need more details to provide specific feedback. Could you share your complete response?"
           
        except Exception as e:
            return f"I'm having trouble analyzing your response right now. Please try again. Error: {str(e)}"
   
    def suggest_networking_strategy(self, user_profile, industry_focus):
        """Suggest networking strategies based on user profile"""
        try:
            profile_context = self._build_profile_context(user_profile)
           
            system_prompt = f"""You are a networking expert providing strategic career networking advice.
           
            User Profile: {profile_context}
            Industry Focus: {industry_focus}
           
            Provide specific networking strategies including:
            1. Key people to connect with
            2. Platform recommendations (LinkedIn, industry events, etc.)
            3. Conversation starters and networking tips
            4. How to maintain professional relationships
           
            Keep advice practical and actionable.
            """
           
            response = client.models.generate_content(
                model=self.model,
                contents=system_prompt
            )
           
            return response.text or "Here's some general networking advice: Start by connecting with classmates and alumni in your field!"
           
        except Exception as e:
            return f"I'm having trouble generating networking strategies right now. Please try again. Error: {str(e)}"
   
    def analyze_career_trajectory(self, user_profile):
        """Analyze user's career trajectory and suggest improvements"""
        try:
            profile_context = self._build_profile_context(user_profile)
           
            system_prompt = f"""You are a career strategist analyzing career trajectories.
           
            User Profile: {profile_context}
           
            Provide a comprehensive career trajectory analysis including:
            1. Assessment of current position
            2. Short-term goals (1-2 years)
            3. Long-term career path (5-10 years)
            4. Skills gaps to address
            5. Recommended next steps
           
            Be specific and actionable in your recommendations.
            """
           
            response = client.models.generate_content(
                model=self.model,
                contents=system_prompt
            )
           
            return response.text or "I need more information about your background to provide a detailed career trajectory analysis."
           
        except Exception as e:
            return f"I'm having trouble analyzing career trajectories right now. Please try again. Error: {str(e)}"
   
    def _build_profile_context(self, user_profile):
        """Build a context string from user profile"""
        if not user_profile:
            return "No profile information available"
       
        context_parts = []
        if user_profile.get('name'):
            context_parts.append(f"Name: {user_profile['name']}")
        if user_profile.get('degree'):
            context_parts.append(f"Degree: {user_profile['degree']}")
        if user_profile.get('skills'):
            context_parts.append(f"Skills: {user_profile['skills']}")
        if user_profile.get('experience_level'):
            context_parts.append(f"Experience Level: {user_profile['experience_level']}")
        if user_profile.get('career_goals'):
            context_parts.append(f"Career Goals: {user_profile['career_goals']}")
        if user_profile.get('interests'):
            context_parts.append(f"Interests: {user_profile['interests']}")
       
        return "\n".join(context_parts) if context_parts else "Limited profile information available"