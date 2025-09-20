import os
import json
import re
from datetime import datetime
from google import genai
from google.genai import types

# IMPORTANT: KEEP THIS COMMENT - Using python_gemini integration
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

class CommunicationCoach:
    def __init__(self):
        self.model = "gemini-2.5-flash"
        self.scenarios = {
            "job_interview": {
                "title": "Job Interview Practice",
                "description": "Practice common interview questions and get feedback on your responses",
                "difficulty": "intermediate",
                "xp_reward": 25
            },
            "networking_event": {
                "title": "Networking Event Simulation",
                "description": "Practice introducing yourself and making professional connections",
                "difficulty": "beginner",
                "xp_reward": 15
            },
            "salary_negotiation": {
                "title": "Salary Negotiation",
                "description": "Learn how to negotiate salary and benefits effectively",
                "difficulty": "advanced",
                "xp_reward": 35
            },
            "team_presentation": {
                "title": "Team Presentation",
                "description": "Practice presenting ideas to colleagues and stakeholders",
                "difficulty": "intermediate",
                "xp_reward": 20
            },
            "difficult_conversation": {
                "title": "Difficult Conversation",
                "description": "Handle challenging workplace conversations with confidence",
                "difficulty": "advanced",
                "xp_reward": 30
            }
        }
        
    def get_available_scenarios(self):
        """Return list of available communication scenarios"""
        return [
            {
                "id": scenario_id,
                **scenario_data
            }
            for scenario_id, scenario_data in self.scenarios.items()
        ]
    
    def start_scenario(self, scenario_type, user_name, session):
        """Start a new communication scenario"""
        if scenario_type not in self.scenarios:
            return {"error": "Invalid scenario type"}
        
        scenario = self.scenarios[scenario_type]
        
        # Initialize scenario state in session
        session['current_scenario'] = {
            'type': scenario_type,
            'stage': 'introduction',
            'user_name': user_name,
            'responses': [],
            'started_at': datetime.now().isoformat()
        }
        
        try:
            # Generate scenario introduction using AI
            system_prompt = f"""You are a professional communication coach running a '{scenario['title']}' practice session.
            
            Create an engaging introduction for {user_name} that:
            1. Explains the scenario context
            2. Sets up the roleplay situation
            3. Provides the first prompt/question for the user to respond to
            
            Keep it professional but encouraging. Make it feel like a real-world situation.
            """
            
            response = client.models.generate_content(
                model=self.model,
                contents=system_prompt
            )
            
            intro_message = response.text or f"Welcome to the {scenario['title']} practice session! Let's get started."
            
            return {
                "scenario": scenario,
                "introduction": intro_message,
                "stage": "active"
            }
            
        except Exception as e:
            return {
                "scenario": scenario,
                "introduction": f"Welcome to the {scenario['title']} practice session! This is a great opportunity to improve your communication skills. Let's begin with a simple question: How would you introduce yourself in this situation?",
                "stage": "active"
            }
    
    def continue_scenario(self, user_response, session):
        """Continue the communication scenario based on user response"""
        current_scenario = session.get('current_scenario')
        
        if not current_scenario:
            return {"error": "No active scenario found"}
        
        # Add user response to history
        current_scenario['responses'].append({
            'user_response': user_response,
            'timestamp': datetime.now().isoformat()
        })
        
        scenario_info = self.scenarios[current_scenario['type']]
        
        try:
            # Generate AI feedback and next prompt
            system_prompt = f"""You are a communication coach providing feedback in a '{scenario_info['title']}' scenario.
            
            User's latest response: "{user_response}"
            
            Provide:
            1. Brief, constructive feedback on their response
            2. Specific suggestions for improvement
            3. A follow-up question or next challenge
            
            Keep feedback encouraging but specific. Help them improve their communication skills.
            """
            
            response = client.models.generate_content(
                model=self.model,
                contents=system_prompt
            )
            
            coach_response = response.text or "Good response! Let's continue practicing."
            
            # Check if scenario should end (after 3-5 exchanges)
            response_count = len(current_scenario['responses'])
            if response_count >= 4:
                # End scenario and award XP
                xp_earned = scenario_info['xp_reward']
                session['user_xp'] = session.get('user_xp', 0) + xp_earned
                
                # Add to activity history
                if 'activity_history' not in session:
                    session['activity_history'] = []
                
                session['activity_history'].insert(0, {
                    'title': f'Completed {scenario_info["title"]}',
                    'description': f'Practiced communication skills and earned {xp_earned} XP',
                    'xp': xp_earned,
                    'time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                })
                
                # Clear current scenario
                session.pop('current_scenario', None)
                
                return {
                    "coach_response": coach_response,
                    "scenario_complete": True,
                    "xp_earned": xp_earned,
                    "stage": "complete"
                }
            
            return {
                "coach_response": coach_response,
                "scenario_complete": False,
                "stage": "active"
            }
            
        except Exception as e:
            return {
                "coach_response": "I appreciate your response. Let's continue practicing - can you try expressing that idea in a different way?",
                "scenario_complete": False,
                "stage": "active"
            }
    
    def get_quick_tip(self, topic=None):
        """Get a quick communication tip"""
        tips = [
            "Maintain eye contact to show confidence and engagement",
            "Use the STAR method (Situation, Task, Action, Result) when answering behavioral questions",
            "Practice active listening by paraphrasing what others say",
            "Start with a strong handshake and genuine smile",
            "Prepare 3-5 thoughtful questions to ask your interviewer",
            "Use specific examples to demonstrate your skills and achievements",
            "Match your communication style to your audience",
            "Take a pause before answering difficult questions",
            "End conversations with a clear next step or follow-up",
            "Practice your elevator pitch until it feels natural"
        ]
        
        if topic:
            # Try to provide topic-specific tip using AI
            try:
                system_prompt = f"""Provide a specific, actionable communication tip related to: {topic}
                
                Make it practical and something someone can implement immediately.
                Keep it to 1-2 sentences maximum.
                """
                
                response = client.models.generate_content(
                    model=self.model,
                    contents=system_prompt
                )
                
                return response.text or tips[0]
                
            except Exception:
                return tips[0]
        
        # Return random tip
        import random
        return random.choice(tips)
    
    def get_user_progress(self, session):
        """Get user's communication progress and stats"""
        activity_history = session.get('activity_history', [])
        communication_activities = [
            activity for activity in activity_history
            if 'communication' in activity.get('title', '').lower() or 
               any(scenario in activity.get('title', '').lower() for scenario in self.scenarios.keys())
        ]
        
        total_scenarios = len(communication_activities)
        total_xp_from_communication = sum(
            activity.get('xp', 0) for activity in communication_activities
        )
        
        # Calculate level based on total XP
        total_xp = session.get('user_xp', 0)
        level = max(1, total_xp // 100)
        xp_to_next_level = 100 - (total_xp % 100)
        
        return {
            "level": level,
            "total_xp": total_xp,
            "xp_to_next_level": xp_to_next_level,
            "scenarios_completed": total_scenarios,
            "communication_xp": total_xp_from_communication,
            "recent_activities": communication_activities[:5]
        }
    
    def get_tone_analysis(self, text):
        """Analyze the tone of user's text"""
        try:
            system_prompt = f"""Analyze the tone and communication effectiveness of this text:
            
            "{text}"
            
            Provide analysis on:
            1. Overall tone (professional, casual, confident, etc.)
            2. Clarity and conciseness
            3. Strengths in the communication
            4. Areas for improvement
            5. Suggested revisions if needed
            
            Keep feedback constructive and specific.
            """
            
            response = client.models.generate_content(
                model=self.model,
                contents=system_prompt
            )
            
            return response.text or "Your message is clear and professional. Well done!"
            
        except Exception as e:
            return "I'm having trouble analyzing the tone right now. Generally, aim for clarity, confidence, and appropriate formality for your audience."