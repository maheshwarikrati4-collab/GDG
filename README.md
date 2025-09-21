# remove replit's git history
rm -rf .git

# reinitialize git
git init
git branch -M main

# create requirements.txt
echo "flask" > requirements.txt
echo "google-generativeai" >> requirements.txt

# create README.md
cat > README.md <<EOL
# AI Personal Growth Agents

This project is a Python-based prototype containing multiple AI agents:

- Career Advisor
- Communication Coach

## Run locally
\`\`\`bash
pip install -r requirements.txt
python main.py
\`\`\`
EOL

# stage & commit
git add .
git commit -m "Initial commit - AI Personal Growth Agents"

# connect to GitHub (replace with your repo URL)
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
