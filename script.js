    document.addEventListener("DOMContentLoaded", function () {
        const storedData = localStorage.getItem('studentData');
        const htno = JSON.parse(storedData).rollno;
        const apiUrl =` https://bvcr-cmm-backend-bazi.onrender.com/api/results/${htno}`; 

        const gradeValues = {
            "A+": 10, "A": 9, "B": 8, "C": 7, "D": 6, "E": 5, "F": 0
        };

        const semesterGrades = {};
        const semesterSgpa = {};
        const semesterCredits = {};
        
       
       
        if (storedData) {
            const formData = JSON.parse(storedData);
            updateResultsPage(formData);
        }

        function updateResultsPage(formData) {
            document.getElementById('studentRegNo').textContent = formData.rollno;
            document.getElementById('studentName').textContent = formData.name;
            document.getElementById('studentBranch').textContent = formData.branch;
            document.getElementById('academicyear').textContent = formData.yearValue;
        }

        // function calculateSGPA(grades, credits) {
        //     let totalCredits = 0;
        //     let totalGradePoints = 0;

        //     grades.forEach((grade, index) => {
        //         const gradePoint = gradeValues[grade] || 0;
        //         const credit = Number(credits[index]) || 0;
        //         totalGradePoints += gradePoint * credit;
        //         totalCredits += credit;
        //     });

            

        //     return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : "N/A";
        // }


        function calculateSGPA(grades, credits) {
            let totalCredits = 0;
            let totalGradePoints = 0;
        
            for (let i = 0; i < grades.length; i++) {
                if (grades[i] === 'F') {
                    return "N/A"; // Return "N/A" if any grade is 'F'
                }
        
                const gradePoint = gradeValues[grades[i]] || 0;
                const credit = Number(credits[i]) || 0;
                totalGradePoints += gradePoint * credit;
                totalCredits += credit;
            }
        
            return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : "N/A";
        }
        

        // function calculateCGPA() {      
        //     let totalCredits = 0;
        //     let totalWeightedSgpa = 0;

        //     Object.keys(semesterSgpa).forEach((semester) => {
        //         const sgpa = Number(semesterSgpa[semester]);
        //         const credits = semesterCredits[semester];

        //         totalWeightedSgpa += sgpa * credits;
        //         totalCredits += credits;
        //     });

        //     return totalCredits > 0 ? (totalWeightedSgpa / totalCredits).toFixed(2) : "N/A";
        // }


        function calculateCGPA() {      
            let totalCredits = 0;
            let totalWeightedSgpa = 0;
        
            for (let semester in semesterSgpa) {
                const sgpa = semesterSgpa[semester];
        
                // Check if sgpa is "N/A"
                if (sgpa === "N/A") {
                    return "N/A";
                }
        
                const credits = semesterCredits[semester];
                totalWeightedSgpa += Number(sgpa) * credits;
                totalCredits += credits;
            }
        
            return totalCredits > 0 ? (totalWeightedSgpa / totalCredits).toFixed(2) : "N/A";
        }
        



        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById("tablesContainer");
                container.innerHTML = "";


                let rowContainer = document.createElement("div");
                rowContainer.className = "flex flex-wrap justify-between  w-full";

                let count = 0;
                let tableCount = 0;
                let currentYear = 1;
                


                Object.keys(data).forEach((semesterKey) => {
                    const semesterData = data[semesterKey];
                    console.log(semesterData);
                    const semester = { results_1_1:"Semester 1" , results_1_2 : "Semester 2", results_2_1 : "Semester 1", results_2_2 : "Semester 2", results_3_1 : "Semester 1", results_3_2 : "Semester 2", results_4_1 : "Semester 1", results_4_2 : "Semester 2"};

                    semesterGrades[semesterKey] = semesterData.map(row => row.Grade);
                    const credits = semesterData.map(row => Number(row.Credits) || 0);
                    semesterCredits[semesterKey] = credits.reduce((a, b) => a + b, 0);

                    const year = Math.ceil(parseInt(semesterKey.split('_')[1]) / 2);
                    if (tableCount % 2 === 0) { // Add year heading every 2 tables
                        const yearRow = document.createElement("div");
                        yearRow.className = "w-full year-con text-center text-lg font-bold  rounded-md shadow";
                        yearRow.textContent = `Year ${currentYear}`;
                        container.appendChild(yearRow);
                        currentYear++;
                    }
                    
                    tableCount++;


                    const table = document.createElement("table");
                    table.className = "border-collapse border w-full";

                    table.innerHTML = `
                
                    <thead>
                        <tr style="text-align: center; font-weight: bold;">
                        <th colspan="6">${semester[semesterKey]}</th>
                    </tr>
                    </thead>
                        <thead>
                            <tr>
                            
                                <th>S.No</th>
                                <th>Subject Name</th>
                                <th>Subject Code</th>
                                <th>Grade</th>
                                <th>Status</th>
                                <th>Credits</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    `;

                    const tbody = table.querySelector("tbody");

                    semesterData.forEach((row, idx) => {
                        const tr = document.createElement("tr");
                        tr.innerHTML = `
                            <td>${idx + 1}</td>
                            <td>${row.Subname}</td>
                            <td>${row.Subcode}</td>
                            <td>${row.Grade}</td>
                            <td>${row.Grade !== 'F' ? 'Pass' : 'Fail'}</td>
                            <td>${row.Credits}</td>
                        `;
                        tbody.appendChild(tr);
                    });

                    const semesterContainer = document.createElement("div");
                    semesterContainer.className = "w-1/2 bg-gray-200 p-2 rounded-lg shadow-md";

                    semesterContainer.appendChild(table);
                    console.log(semesterKey);
                    const sgpa = calculateSGPA(semesterGrades[semesterKey], credits);
                    semesterSgpa[semesterKey] = sgpa;
                    console.log(semesterSgpa);

                    const sgpaDisplay = document.createElement("div");
                    sgpaDisplay.className = "sgpa mt-2 font-semibold";
                    sgpaDisplay.innerHTML = ` SGPA   : <span class="text-blue-600">${sgpa}</span>`;
                    semesterContainer.appendChild(sgpaDisplay);

                    rowContainer.appendChild(semesterContainer);
                    count++;

                    if (count % 2 === 0 || count === Object.keys(data).length) {
                        container.appendChild(rowContainer);
                        rowContainer = document.createElement("div");
                        rowContainer.className = "flex flex-wrap justify-between  w-full";
                    }
                });

                const cgpa = calculateCGPA();
                document.getElementById("cgpa").textContent = cgpa;
            })
            .catch(error => console.error("Error fetching data:", error));
    });

