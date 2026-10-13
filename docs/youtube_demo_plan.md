# CardioVista AI — YouTube Video Demonstration Plan (3–10 Minutes)

**Video Title:** CardioVista AI — Interactive 3D Heart Visualization & Explainable CAD Prediction  
**Duration:** 5 Minutes 30 Seconds  
**Format:** Screen Recording with Voiceover Narration and Live Demo  

---

## 1. Video Demonstration Objectives & Scoring Alignment
- **Predictive Performance (30%):** Demonstrate real scikit-learn models predicting primary CAD and LAD, LCX, RCA branch stenosis.
- **3D Visualization (25%):** Showcase interactive 3D anatomical heart in WebGL, 360° rotation, preset camera focus, dynamic color mapping, and cardiac cycle pulsation.
- **Interpretability (20%):** Walk through feature contribution rankings, biomarker clinical notes, and association vs. causation.
- **Integration (15%):** Show real-time FastAPI to React communication with benchmark patient profiles.
- **Technical Implementation (10%):** Highlight clean code architecture, 5-fold cross-validation, and automated tests.

---

## 2. Scene-by-Scene Storyboard & Narration Script

### Scene 1: Introduction & Elevator Pitch (0:00 – 0:45)
- **Visual:** Full-screen browser showing CardioVista AI landing page with the 3D heart pulsing in real time. Cursor highlights the title and medical safety disclaimer banner.
- **Narration:**  
  *"Hello hackathon judges and clinical AI enthusiasts. Welcome to CardioVista AI. CardioVista AI combines machine learning with interactive 3D heart visualization to predict coronary artery disease outcomes, explore artery-specific stenosis across the LAD, LCX, and RCA, and explain the clinical factors influencing each result. CardioVista AI is an educational and research prototype developed using real clinical data from the Tehran Heart Center."*

### Scene 2: Dataset Provenance & Leakage Prevention (0:45 – 1:30)
- **Visual:** Click "Methodology & Limitations" button in the navigation bar to open the modal. Scroll down to Dataset Provenance and Target Leakage Isolation.
- **Narration:**  
  *"Our models train on the UCI Extension of Z-Alizadeh Sani Dataset, featuring 303 angiographically evaluated patients with 59 attributes across demographic, ECG, laboratory, and echocardiography tiers. A critical challenge in clinical ML is target leakage. In CardioVista AI, all angiography outcome targets—Cath, LAD, LCX, and RCA—are strictly excluded from the predictor feature set. We fit all imputation, scalers, and encoders strictly within cross-validation training folds to ensure genuine generalization."*

### Scene 3: Live Clinical Patient Prediction & Benchmark Case 1 (1:30 – 2:30)
- **Visual:** Close modal. On the clinical form, click the "Low Risk" benchmark case button. Point out the input fields updating across tabs. Click "Analyze Patient". Show the prediction results updating.
- **Narration:**  
  *"Let's demonstrate live inference. Clicking 'Low Risk' populates an authentic non-CAD profile from our dataset: 52-year-old female, non-anginal symptoms, normal ECG, and 55% ejection fraction. Upon running inference against our FastAPI backend, the model predicts low CAD likelihood with under 15% probability. Notice our 3D heart model: all three coronary vessels—LAD, LCX, and RCA—are glowing in reassuring emerald green, indicating patent vessels with less than 50% stenosis."*

### Scene 4: 3D Heart Interaction & Multivessel CAD Benchmark Case 2 (2:30 – 3:45)
- **Visual:** Drag the 3D heart to rotate 360°. Scroll wheel to zoom in on the anterior sulcus. Click "Multivessel CAD" button. Click "Analyze Patient". Observe the vessels turn red/amber. Click "LAD View" button.
- **Narration:**  
  *"Now let's load a complex scenario: 'Multivessel CAD'. This patient is a 69-year-old diabetic male with typical angina, ST elevations, elevated triglycerides, and regional wall kinetic defects. Instantly, our model predicts high CAD likelihood with an 88% probability and multi-branch stenosis. Observe the 3D visualization: the Left Anterior Descending artery immediately transitions to alert crimson red with an emissive glow. Clicking 'LAD View' smoothly pans and zooms the camera directly onto the anterior interventricular sulcus and reveals our anatomical inspection card detailing the anterior wall perfusion territory."*

### Scene 5: Transparent Model Explainability (3:45 – 4:30)
- **Visual:** Scroll down to the "Model Explainability" panel. Click through target tabs (CAD, LAD, LCX, RCA). Point out the top contributing features and clinical notes.
- **Narration:**  
  *"Clinicians don't trust black boxes. In our Explainability panel, CardioVista AI ranks the top contributing features driving each model. For primary CAD, typical chest pain, regional wall motion abnormalities, and age are top factors. For the LAD branch specifically, wall motion defect and ejection fraction dominate, aligning directly with cardiovascular pathophysiology because the LAD supplies 50% of the left ventricular pump. Notice our prominent ethical note clarifying that these features represent statistical correlations, not direct clinical causation."*

### Scene 6: Rigorous Evaluation Metrics & Architecture (4:30 – 5:05)
- **Visual:** Click "Evaluation Metrics" in the top bar. Show the 5-fold cross-validation scores, holdout test metrics (89.6% F1 for CAD, 80.6% F1 for LAD), and the confusion matrix.
- **Narration:**  
  *"Rather than fabricated metrics, our Evaluation Metrics modal surfaces actual empirical results directly from the fitted models. With 5-fold cross-validation and a 20% unseen holdout partition, our CAD model achieves an 89.6% CV F1 score and a 0.904 holdout ROC-AUC, while LAD stenosis achieves an 80.6% CV F1 score."*

### Scene 7: Summary, Safety Disclaimer & Conclusion (5:05 – 5:30)
- **Visual:** Pan back to the overview dashboard showing the pulsing 3D heart, disclaimer, and GitHub repository.
- **Narration:**  
  *"To conclude: CardioVista AI brings together rigorous leakage-free machine learning, real-time 3D WebGL anatomical visualization, and transparent explainability in a modern full-stack web application. CardioVista AI is an educational research prototype reminding us that AI in healthcare must always be grounded in transparency, safety, and rigorous science. Thank you!"*
