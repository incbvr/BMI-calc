const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Default route to serve index.html from public folder
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// BMI calculation
function calculateBMI(weight, heightCm) {
  const height = heightCm / 100; // Convert cm to meters
  return weight / (height * height);
}

// Age risk points
function getAgeRiskPoints(age) {
  if (age < 30) return 0;
  if (age < 45) return 10;
  if (age < 60) return 20;
  return 30;
}

// BMI risk points
function getBMIRiskPoints(bmi) {
  if (bmi < 25) return 0;
  if (bmi < 30) return 30;
  return 75;
}

// Blood pressure risk points
function getBloodPressureRiskPoints(systolic, diastolic) {
  if (systolic < 120 && diastolic < 80) return 0; 
  if (systolic < 130 && diastolic < 80) return 15; 
  if (systolic < 140 || diastolic < 90) return 30; 
  if (systolic <= 180 || diastolic <= 120) return 75; 
  return 100;
}

// Family history risk points
function getFamilyHistoryRiskPoints(familyHistory) {
  let points = 0;
  if (Array.isArray(familyHistory)) {
    if (familyHistory.includes("diabetes")) points += 10;
    if (familyHistory.includes("cancer")) points += 10;
    if (familyHistory.includes("Alzheimer's")) points += 10;
  }
  return points;
}

// Determine risk category based on total points
function getRiskCategory(totalPoints) {
  if (totalPoints <= 20) return "low risk";
  if (totalPoints <= 50) return "moderate risk";
  if (totalPoints <= 75) return "high risk";
  return "uninsurable";
}

// API endpoint to calculate risk
app.post('/calculateRisk', (req, res) => {
  const { age, weight, heightCm, systolic, diastolic, familyHistory } = req.body;

  if (heightCm < 60) {
    return res.status(400).json({ error: "Height must be at least 60 cm." });
  }

  const agePoints = getAgeRiskPoints(age);
  const bmi = calculateBMI(weight, heightCm);
  const bmiPoints = getBMIRiskPoints(bmi);
  const bpPoints = getBloodPressureRiskPoints(systolic, diastolic);
  const fhPoints = getFamilyHistoryRiskPoints(familyHistory);
  
  const totalPoints = agePoints + bmiPoints + bpPoints + fhPoints;
  const riskCategory = getRiskCategory(totalPoints);
  
  res.json({
    agePoints,
    bmiPoints,
    bpPoints,
    fhPoints,
    totalPoints,
    riskCategory,
    bmi: bmi.toFixed(2)
  });
});

// Start the server (only once)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
