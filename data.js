// Seed database and mock models for Sangram-Mitra Platform

const MOCK_DATA = {
  roles: {
    student: {
      id: "STU-2026-9842",
      name: "Rahul Kumar",
      avatar: "RK",
      email: "rahul.kumar@sangram.edu.in",
      phone: "9876543210",
      district: "Visakhapatnam",
      state: "Andhra Pradesh",
      college: "Andhra University College of Engineering",
      education: "B.Tech CSE (AI & Machine Learning)",
      gradYear: 2026,
      targetRole: "Junior Data & AI Engineer",
      skillScore: 74,
      profileCompletion: 85,
      employmentStatus: "Employed",
      currentCompany: "Infosys BPM Tech Lab",
      currentRole: "Associate AI Trainee",
      monthlySalary: 28500,
      joiningDate: "01 Aug 2026",
      isVerified: true,
      verifiedBy: "Infosys HR Central (ID: EMP-INF-491)",
      verifiedOn: "05 Aug 2026",
      verificationHash: "0x8F9C2B...34E1D",
      milestones: [
        { month: "1st Month (Joining)", salary: 28500, status: "Completed", date: "Aug 2026", verified: true, notes: "Onboarding and bootcamp completed." },
        { month: "3rd Month Check-in", salary: 28500, status: "Completed", date: "Oct 2026", verified: true, notes: "Retention verified. Performance rating: 4.5/5" },
        { month: "6th Month Milestone", salary: 32000, status: "Upcoming", date: "Jan 2027", verified: false, notes: "Probation confirmation + 12% wage hike scheduled." },
        { month: "12th Month Annual Review", salary: 38000, status: "Planned", date: "Jul 2027", verified: false, notes: "Annual retention review and career progression." }
      ],
      skills: {
        "Python": 82,
        "SQL & DB": 52,
        "Data Structures & Algorithms": 45,
        "Machine Learning": 70,
        "Git & CI/CD": 68,
        "Cloud Fundamentals (AWS/Azure)": 38,
        "Communication & Interview Readiness": 65
      },
      courses: [
        { id: "C101", title: "Applied Python for AI & Data Science", provider: "NASSCOM FutureSkills Prime", progress: 85, status: "In Progress", duration: "60 Hours", badge: "Gold Candidate" },
        { id: "C102", title: "Production SQL & Data Modeling Masterclass", provider: "Skill India Digital", progress: 45, status: "Priority Need", duration: "40 Hours", badge: "In Gap Plan" },
        { id: "C103", title: "Data Structures & Problem Solving in Python", provider: "AP Skill Development Corp (APSSDC)", progress: 25, status: "Started", duration: "80 Hours", badge: "Core Skill" },
        { id: "C104", title: "AWS Cloud Practitioner & Serverless Basics", provider: "AWS Academy", progress: 10, status: "Enrolled", duration: "30 Hours", badge: "Recommended" }
      ]
    },
    employer: {
      id: "EMP-INF-491",
      name: "Infosys Talent Acquisition & Verification",
      contactPerson: "Priya Sharma (Lead Campus Recruiter)",
      email: "priya.sharma@infosys.com",
      company: "Infosys Technologies Ltd",
      sector: "Information Technology & AI",
      district: "Visakhapatnam SEZ Hub",
      activePostings: 14,
      candidatesVerified: 142,
      pendingVerifications: 3
    },
    admin: {
      id: "ADM-APSSDC-01",
      name: "Dr. K. Srinivas Rao",
      designation: "Director - Skill Outcome Analytics & Monitoring",
      department: "State Skill Development Mission (APSSDC)",
      jurisdiction: "All 26 Districts of Andhra Pradesh",
      activeBatches: 218,
      totalTrained: 184500,
      totalPlaced: 142300,
      avgRetentionRate: "81.4%"
    }
  },

  benchmarks: {
    "Junior Data & AI Engineer": {
      "Python": 80,
      "SQL & DB": 75,
      "Data Structures & Algorithms": 70,
      "Machine Learning": 65,
      "Git & CI/CD": 70,
      "Cloud Fundamentals (AWS/Azure)": 60,
      "Communication & Interview Readiness": 70
    },
    "Full Stack Web Developer": {
      "Python": 60,
      "SQL & DB": 80,
      "Data Structures & Algorithms": 75,
      "Machine Learning": 20,
      "Git & CI/CD": 85,
      "Cloud Fundamentals (AWS/Azure)": 65,
      "Communication & Interview Readiness": 75
    },
    "Cloud & DevOps Associate": {
      "Python": 65,
      "SQL & DB": 50,
      "Data Structures & Algorithms": 55,
      "Machine Learning": 25,
      "Git & CI/CD": 90,
      "Cloud Fundamentals (AWS/Azure)": 85,
      "Communication & Interview Readiness": 70
    }
  },

  assessmentQuestions: [
    {
      id: 1,
      category: "Python",
      question: "In Python, which built-in data structure guarantees O(1) average time complexity for lookup and membership testing?",
      options: ["List", "Tuple", "Set / Dictionary", "Linked List"],
      correct: 2,
      explanation: "Python's `set` and `dict` use hash tables under the hood, yielding O(1) average lookup time."
    },
    {
      id: 2,
      category: "Python",
      question: "What is the primary difference between `deepcopy` and `shallow copy` in Python's `copy` module?",
      options: [
        "Deepcopy only copies integers, shallow copy copies all objects",
        "Deepcopy constructs a new compound object and recursively copies objects found in the original",
        "Shallow copy modifies the original object in place",
        "Deepcopy is used only for thread safety"
      ],
      correct: 1,
      explanation: "A deep copy recursively duplicates nested elements, whereas a shallow copy duplicates only the top-level container."
    },
    {
      id: 3,
      category: "SQL & DB",
      question: "Which SQL clause is used to filter records AFTER an aggregation operation (like SUM or COUNT)?",
      options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"],
      correct: 1,
      explanation: "`HAVING` filters group-level aggregations, while `WHERE` filters individual rows prior to grouping."
    },
    {
      id: 4,
      category: "SQL & DB",
      question: "In a relational database, what does an INDEX on a table column primarily improve?",
      options: [
        "Insert and Update speed",
        "SELECT query search speed at the cost of slight write overhead",
        "Database storage compression ratio",
        "Foreign key cascade constraints"
      ],
      correct: 1,
      explanation: "Indexes (B-Trees / Hash) speed up read queries (SELECT) by reducing scanned rows, but add overhead during write operations."
    },
    {
      id: 5,
      category: "Data Structures & Algorithms",
      question: "What is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree (BST)?",
      options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
      correct: 2,
      explanation: "An unbalanced BST degenerates into a singly-linked list in the worst case, resulting in O(N) traversal."
    },
    {
      id: 6,
      category: "Data Structures & Algorithms",
      question: "Which algorithmic paradigm does Dijkstra's shortest path algorithm utilize?",
      options: ["Divide and Conquer", "Greedy Approach with a Priority Queue", "Backtracking", "Randomized Sampling"],
      correct: 1,
      explanation: "Dijkstra's algorithm greedily selects the minimum distance unvisited vertex using a min-heap / priority queue."
    },
    {
      id: 7,
      category: "Cloud Fundamentals (AWS/Azure)",
      question: "Which cloud computing service model provides virtualized hardware (VMs, storage, virtual networks) with maximum OS control?",
      options: ["SaaS (Software as a Service)", "PaaS (Platform as a Service)", "IaaS (Infrastructure as a Service)", "FaaS (Function as a Service)"],
      correct: 2,
      explanation: "IaaS (e.g. AWS EC2, Azure VMs) provides raw compute, storage, and networking with full guest OS control."
    },
    {
      id: 8,
      category: "Git & CI/CD",
      question: "What does `git rebase` do compared to `git merge`?",
      options: [
        "Deletes all previous commits",
        "Applies commits from one branch on top of another base tip, creating a linear history",
        "Only pushes changes to remote repository",
        "Creates an automatic rollback snapshot"
      ],
      correct: 1,
      explanation: "Rebase rewrites commit history linearly by re-applying commits onto the specified base branch."
    },
    {
      id: 9,
      category: "Communication & Interview Readiness",
      question: "When answering behavioral interview questions (e.g., 'Tell me about a time you solved a conflict'), which framework is standard?",
      options: [
        "SWOT (Strengths, Weaknesses, Opportunities, Threats)",
        "STAR (Situation, Task, Action, Result)",
        "PDCA (Plan, Do, Check, Act)",
        "SMART (Specific, Measurable, Achievable, Relevant, Timely)"
      ],
      correct: 1,
      explanation: "The STAR method structures clear, concise, and impact-driven behavioral responses."
    },
    {
      id: 10,
      category: "Machine Learning",
      question: "What issue is indicated when a model achieves 99% accuracy on training data but drops to 62% on test data?",
      options: ["Underfitting", "Overfitting (High Variance)", "High Bias", "Data Leakage"],
      correct: 1,
      explanation: "Overfitting occurs when the model memorizes training noise rather than generalizing to unseen validation/test data."
    }
  ],

  districts: [
    {
      id: "AP-VSKP",
      name: "Visakhapatnam",
      region: "Coastal Andhra",
      youthAssessed: 28450,
      trainedCandidates: 22100,
      placedCandidates: 18450,
      retentionRate: "83.5%",
      avgSalary: "₹26,800/mo",
      topDemandSectors: ["IT & Software", "Pharma & Life Sciences", "Maritime Logistics", "AI/ML"],
      primarySkillGaps: [
        { skill: "Data Structures & Algorithms", gapPct: 38 },
        { skill: "Cloud & DevOps", gapPct: 44 },
        { skill: "Advanced SQL", gapPct: 32 }
      ],
      trainingCenters: 34,
      employersActive: 185
    },
    {
      id: "AP-VJA",
      name: "Vijayawada (NTR)",
      region: "Krishna Valley",
      youthAssessed: 24300,
      trainedCandidates: 19800,
      placedCandidates: 15900,
      retentionRate: "80.3%",
      avgSalary: "₹23,400/mo",
      topDemandSectors: ["Fintech & Banking", "Automobile & EV Components", "E-Commerce Logistics", "Full Stack Dev"],
      primarySkillGaps: [
        { skill: "Full Stack (React/Node)", gapPct: 42 },
        { skill: "Business Analytics", gapPct: 35 },
        { skill: "Communication Skills", gapPct: 29 }
      ],
      trainingCenters: 28,
      employersActive: 140
    },
    {
      id: "AP-GNT",
      name: "Guntur",
      region: "Capital Region",
      youthAssessed: 21200,
      trainedCandidates: 16500,
      placedCandidates: 12800,
      retentionRate: "77.6%",
      avgSalary: "₹21,500/mo",
      topDemandSectors: ["Agri-Tech & Food Processing", "Health-Tech", "Telecom Infra", "Embedded IoT"],
      primarySkillGaps: [
        { skill: "IoT & Embedded C", gapPct: 49 },
        { skill: "SQL & Data Pipeline", gapPct: 41 },
        { skill: "Quality Assurance", gapPct: 34 }
      ],
      trainingCenters: 22,
      employersActive: 98
    },
    {
      id: "AP-TPT",
      name: "Tirupati",
      region: "Rayalaseema South",
      youthAssessed: 19700,
      trainedCandidates: 15200,
      placedCandidates: 12400,
      retentionRate: "81.5%",
      avgSalary: "₹24,100/mo",
      topDemandSectors: ["Electronics Manufacturing (EMC)", "Tourism & Hospitality Tech", "Renewable Energy", "Software"],
      primarySkillGaps: [
        { skill: "SMT & Hardware Diagnostics", gapPct: 46 },
        { skill: "Python Scripting", gapPct: 37 },
        { skill: "Customer Operations Tech", gapPct: 26 }
      ],
      trainingCenters: 24,
      employersActive: 112
    },
    {
      id: "AP-ATP",
      name: "Anantapur",
      region: "Rayalaseema West",
      youthAssessed: 16800,
      trainedCandidates: 12900,
      placedCandidates: 9600,
      retentionRate: "74.4%",
      avgSalary: "₹19,800/mo",
      topDemandSectors: ["Automotive Assembly", "Solar & Wind Tech", "Rural Banking Ops", "Digital Marketing"],
      primarySkillGaps: [
        { skill: "Industrial Robotics Ops", gapPct: 53 },
        { skill: "English Fluency & Soft Skills", gapPct: 48 },
        { skill: "Database Management", gapPct: 39 }
      ],
      trainingCenters: 18,
      employersActive: 67
    }
  ],

  jobOpportunities: [
    {
      id: "JOB-101",
      title: "Associate AI / Data Engineer",
      company: "Wipro Digital Hub",
      location: "Visakhapatnam (Hybrid)",
      salary: "₹3.8 - 4.5 LPA",
      matchScore: 88,
      requiredSkills: ["Python", "SQL & DB", "Machine Learning", "Git"],
      vacancies: 12,
      posted: "2 days ago",
      verifiedEmployer: true
    },
    {
      id: "JOB-102",
      title: "Junior Full Stack Developer",
      company: "Cognizant Technology Solutions",
      location: "Vijayawada / Remote",
      salary: "₹4.0 - 5.2 LPA",
      matchScore: 78,
      requiredSkills: ["Python", "SQL & DB", "Data Structures", "Git"],
      vacancies: 8,
      posted: "1 day ago",
      verifiedEmployer: true
    },
    {
      id: "JOB-103",
      title: "Data Analyst Trainee",
      company: "Tata Consultancy Services (TCS)",
      location: "Visakhapatnam SEZ",
      salary: "₹3.6 - 4.2 LPA",
      matchScore: 84,
      requiredSkills: ["SQL & DB", "Python", "Communication", "Excel/BI"],
      vacancies: 25,
      posted: "Just now",
      verifiedEmployer: true
    },
    {
      id: "JOB-104",
      title: "Cloud Support Associate",
      company: "Cyient Digital Services",
      location: "Tirupati Hub",
      salary: "₹3.5 - 4.0 LPA",
      matchScore: 66,
      requiredSkills: ["Cloud Fundamentals", "Linux", "Git & CI/CD"],
      vacancies: 15,
      posted: "3 days ago",
      verifiedEmployer: true
    }
  ],

  whyNotPlacedDiagnostics: [
    {
      factor: "Technical & Foundational Skill Gap",
      score: "High Impact (42% weight)",
      findings: "Candidate assessment in DSA (45%) and SQL (52%) falls below industry intake benchmark of 70%.",
      status: "Critical Need",
      action: "Enroll in fast-track 4-week APSSDC Coding & SQL Accelerator."
    },
    {
      factor: "Interview & Professional Communication",
      score: "Moderate Impact (25% weight)",
      findings: "Candidate has strong coding logic but needs confidence in behavioral STAR articulation & live pair programming.",
      status: "Actionable",
      action: "Schedule 3 AI-simulated mock video interviews with instant rubric feedback."
    },
    {
      factor: "Geographical & Mobility Constraints",
      score: "Low Impact (12% weight)",
      findings: "Candidate is open to Visakhapatnam, Vijayawada, and Hyderabad tech corridors.",
      status: "Optimized",
      action: "Auto-filter jobs within coastal & southern tech clusters."
    },
    {
      factor: "Resume ATS Match & Portfolio Proof",
      score: "Moderate Impact (21% weight)",
      findings: "Resume lacks live GitHub repository links and verifiable course completion credentials.",
      status: "Quick Fix",
      action: "Use 1-click Resume Builder to embed Verifiable Credential QR codes and GitHub projects."
    }
  ],

  employerVerificationsQueue: [
    {
      id: "VER-901",
      studentName: "Rahul Kumar",
      studentId: "STU-2026-9842",
      role: "Associate AI Trainee",
      department: "Data Engineering",
      offeredSalary: "₹28,500/month",
      joiningDate: "01 Aug 2026",
      status: "Verified",
      verifiedDate: "05 Aug 2026",
      verifier: "Priya Sharma (HR)",
      hash: "0x8F9C2B4E1D7802"
    },
    {
      id: "VER-902",
      studentName: "Sneha Reddy",
      studentId: "STU-2026-5120",
      role: "Junior React Developer",
      department: "Web Solutions",
      offeredSalary: "₹26,000/month",
      joiningDate: "15 Aug 2026",
      status: "Pending Verification",
      verifiedDate: "-",
      verifier: "Awaiting Action",
      hash: "0x3D41AA70F20911"
    },
    {
      id: "VER-903",
      studentName: "Venkata Sai Teja",
      studentId: "STU-2026-7819",
      role: "Cloud Ops Intern",
      department: "Infrastructure",
      offeredSalary: "₹22,000/month",
      joiningDate: "01 Sep 2026",
      status: "Pending Verification",
      verifiedDate: "-",
      verifier: "Awaiting Action",
      hash: "0x56EF01BCC98450"
    }
  ]
};
