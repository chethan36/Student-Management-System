from flask import Flask, request, jsonify
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
import numpy as np
import re

app = Flask(__name__)

# ----------------------------------------------------
# AI Model 1: Detention Risk Prediction via Random Forest
# Features: [attendance_pct, internals_pct, assignment_score_pct, prev_gpa]
# Labels: 0 (Low), 1 (Medium), 2 (High)
# ----------------------------------------------------
X_risk = np.array([
    [95.0, 90.0, 95.0, 8.5],
    [90.0, 85.0, 90.0, 8.0],
    [85.0, 88.0, 85.0, 7.8],
    [80.0, 75.0, 80.0, 7.5],
    [74.0, 70.0, 75.0, 7.0],
    [70.0, 68.0, 70.0, 6.8],
    [65.0, 60.0, 65.0, 6.5],
    [60.0, 55.0, 50.0, 6.0],
    [50.0, 45.0, 40.0, 5.5],
    [40.0, 30.0, 30.0, 5.0],
    [98.0, 95.0, 98.0, 9.2],
    [76.0, 72.0, 74.0, 7.2]
])
y_risk = np.array([0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 0, 1])

# Train Random Forest Classifier for detention risk (replacing XGBoost for compatibility)
risk_model = RandomForestClassifier(
    n_estimators=15, 
    max_depth=3, 
    random_state=42
)
risk_model.fit(X_risk, y_risk)
risk_labels = {0: "Low", 1: "Medium", 2: "High"}

# ----------------------------------------------------
# AI Model 2: Grade Prediction via Random Forest
# Features: [attendance_pct, internal_marks_pct, assignment_score_pct]
# Labels: 0 (A+), 1 (A), 2 (B+), 3 (B), 4 (C), 5 (F)
# ----------------------------------------------------
X_grade = np.array([
    [95.0, 95.0, 98.0],
    [90.0, 88.0, 92.0],
    [85.0, 82.0, 88.0],
    [80.0, 74.0, 80.0],
    [75.0, 60.0, 70.0],
    [50.0, 40.0, 45.0],
    [98.0, 92.0, 96.0],
    [92.0, 86.0, 90.0],
    [88.0, 80.0, 84.0],
    [82.0, 72.0, 78.0],
    [70.0, 55.0, 65.0],
    [45.0, 30.0, 20.0]
])
y_grade = np.array([0, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 5])

grade_model = RandomForestClassifier(n_estimators=10, random_state=42)
grade_model.fit(X_grade, y_grade)
grade_labels = {0: "A+", 1: "A", 2: "B+", 3: "B", 4: "C", 5: "F"}


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "service": "CampusCore AI Engine v2 (Scikit-Learn)"})


@app.route("/predict-attendance-risk", methods=["POST"])
def predict_attendance_risk():
    try:
        data = request.get_json()
        att = float(data.get("attendance_pct", 85.0))
        internals = float(data.get("internal_marks_pct", 80.0))
        assignments = float(data.get("assignment_score_pct", 80.0))
        gpa = float(data.get("prev_gpa", 7.5))

        feat = np.array([[att, internals, assignments, gpa]])
        pred = risk_model.predict(feat)[0]
        prob = risk_model.predict_proba(feat)[0]

        # Formulate a dynamic explanation string based on the features
        explanation = f"Model evaluated attendance rate ({att}%) and current GPA ({gpa}). "
        if pred == 2:
            explanation += "Critical warning: attendance is severely below expectations. Immediate academic review advised."
        elif pred == 1:
            explanation += "Borderline scores. Maintaining regular attendance and score updates is recommended."
        else:
            explanation += "Consistent metrics. Low detention probability calculated."

        return jsonify({
            "risk": risk_labels[pred],
            "confidence": float(prob[pred]),
            "explanation": explanation,
            "probabilities": {risk_labels[i]: float(prob[i]) for i in range(len(risk_labels))}
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/predict-grade", methods=["POST"])
def predict_grade():
    try:
        data = request.get_json()
        att = float(data.get("attendance_pct", 85.0))
        internals = float(data.get("internal_marks_pct", 80.0))
        assignments = float(data.get("assignment_score_pct", 85.0))

        feat = np.array([[att, internals, assignments]])
        pred = grade_model.predict(feat)[0]
        prob = grade_model.predict_proba(feat)[0]

        return jsonify({
            "predicted_grade": grade_labels[pred],
            "confidence": float(prob[pred]),
            "probabilities": {grade_labels[i]: float(prob[i]) for i in range(len(grade_labels))}
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        message = data.get("message", "").strip().lower()
        context = data.get("context", {})
        role = data.get("role", "STUDENT")

        # Context-aware parsing rules
        if "below 75%" in message or "attendance warning" in message or "attendance alert" in message:
            students_list = context.get("lowAttendanceStudents", [])
            if not students_list:
                resp = "All monitored students are currently above the mandatory 75% attendance threshold."
            else:
                resp = "The following students have fallen below the 75% attendance threshold:\n"
                for s in students_list:
                    resp += f"• {s['name']} ({s['usn']}) - Attendance: {s['attendancePct']:.1f}%\n"
                resp += "\nRecommended: Automatically log warning alerts or contact academic advisors."

        elif "at risk" in message or "risk prediction" in message or "danger of detention" in message:
            at_risk_list = context.get("atRiskStudents", [])
            if not at_risk_list:
                resp = "No students are currently classified as medium or high detention risk by the ML model."
            else:
                resp = "AI Model predicts detention warnings for these candidates:\n"
                for s in at_risk_list:
                    resp += f"• {s['name']} ({s['usn']}) - Predicted Risk Level: **{s['risk']}** (Confidence: {s['confidence']*100:.0f}%)\n"
                resp += "\nRecommended Action: Send low-attendance emails and schedule 1-on-1 feedback sessions."

        elif "top performer" in message or "highest grade" in message or "distinction" in message:
            top_performers = context.get("topPerformers", [])
            if not top_performers:
                resp = "No candidates currently forecasted for distinction grades."
            else:
                resp = "Here are the top performing candidates (forecasted A/A+ grades):\n"
                for s in top_performers:
                    resp += f"• {s['name']} ({s['usn']}) - Predicted Grade: **{s['predictedGrade']}** (Confidence: {s['confidence']*100:.0f}%)\n"

        elif "java quiz" in message or "generate quiz" in message:
            resp = ("Here is an AI-generated Java Quiz for review:\n\n"
                    "**Question 1**: Which of the following is true about abstract classes in Java?\n"
                    "  A) They cannot have constructors\n"
                    "  B) They can contain final methods that cannot be overridden\n"
                    "  C) They can be instantiated directly using the new keyword\n"
                    "  D) They can only contain abstract methods\n\n"
                    "**Correct Answer**: **B** - Abstract classes can indeed contain final methods to prevent overriding, but they cannot be instantiated directly.")

        elif "attendance report" in message:
            overall = context.get("overallAttendance", 87.5)
            resp = f"Academic Attendance Report Summary:\n- Overall campus compliance rate: {overall:.1f}%\n- Month-on-month trend: Positive trajectory (+1.4%)\n\nYou can download the full PDF/Excel report using the export actions in the page header."

        else:
            # Default response
            resp = ("Hello! I am your Campus AI assistant. I have access to academic metrics and intelligence charts.\n\n"
                    "Ask me questions like:\n"
                    "• *Which students are at risk of detention?*\n"
                    "• *Show students with attendance below 75%*\n"
                    "• *Generate a Java quiz*\n"
                    "• *Provide overall attendance report summary*")

        return jsonify({"response": resp})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(port=port, host="0.0.0.0")
