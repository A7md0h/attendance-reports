import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDC1c9UIHn5d1SaWg1VeJwaWsRYE3aCCKU",
    authDomain: "hadir-e1706.firebaseapp.com",
    projectId: "hadir-e1706",
    storageBucket: "hadir-e1706.appspot.com",
    messagingSenderId: "216498723412",
    appId: "1:216498723412:web:b83c70cd8500b3fba5abc1"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // تهيئة Firestore

// التأكد من تحميل DOM
window.addEventListener('DOMContentLoaded', () => {
    const reportTypeSelect = document.getElementById('report-type');
    const reportClassSelect = document.getElementById('report-class');
    const reportPeriodSelect = document.getElementById('report-period'); // اختيار الحصة
    const reportDateInput = document.getElementById('report-date');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const generateReportButton = document.getElementById('generate-report');
    const reportTableBody = document.getElementById('report-table').querySelector('tbody');
    const printButton = document.getElementById('print-report');

    // دالة توليد التقرير
    async function generateReport() {
        const reportType = reportTypeSelect.value;
        const selectedClass = reportClassSelect.value;
        const selectedPeriod = reportPeriodSelect.value; // الحصة المحددة
        const reportDate = reportDateInput.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        // مسح محتويات الجدول السابقة
        reportTableBody.innerHTML = '';

        let q;
        if (selectedClass === 'all') {
            // جلب جميع الصفوف
            q = query(collection(db, "attendance"));
        } else {
            // جلب التقارير بناءً على الصف المحدد
            q = query(collection(db, "attendance"), where("grade", "==", selectedClass));
        }

        try {
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                data.students.forEach((student) => {
                    // التحقق من الحصة المحددة، إذا كانت "الكل" أو تطابق الحصة المحددة
                    if ((selectedPeriod === 'all' || data.period === selectedPeriod) && student.attendance === "غياب") {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${student.name}</td>
                            <td>${data.grade}</td>
                            <td>${data.class}</td>
                            <td>${new Date(data.timestamp.seconds * 1000).toLocaleDateString()}</td>
                            <td>${data.period}</td>
                            <td>${student.attendance}</td>
                        `;
                        reportTableBody.appendChild(row);
                    }
                });
            });
        } catch (error) {
            console.error("حدث خطأ أثناء جلب البيانات:", error);
        }
    }

    // دالة طباعة التقرير
    function printReport() {
        window.print(); // فتح نافذة الطباعة
    }

    // ربط أزرار الطباعة
    printButton.addEventListener('click', printReport);

    // حدث عند الضغط على زر توليد التقرير
    generateReportButton.addEventListener('click', generateReport);

    // تغيير عرض الحقول بناءً على نوع التقرير
    reportTypeSelect.addEventListener('change', () => {
        const reportType = reportTypeSelect.value;
        if (reportType === 'custom') {
            document.querySelectorAll('.date-picker')[1].style.display = 'block';
        } else {
            document.querySelectorAll('.date-picker')[1].style.display = 'none';
        }
    });
});
