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
    const reportDateInput = document.getElementById('report-date');
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const generateReportButton = document.getElementById('generate-report');
    const reportTableBody = document.getElementById('report-table').querySelector('tbody');
    const printButton = document.getElementById('print-report');
    const downloadButton = document.getElementById('download-pdf');

    // دالة توليد التقرير
    async function generateReport() {
        const reportType = reportTypeSelect.value;
        const selectedClass = reportClassSelect.value;
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
                    if (student.attendance === "غياب") { // تصفية الطلاب حسب حالة الغياب فقط
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

    // دالة تنزيل التقرير كملف PDF
    function downloadPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // إضافة عنوان التقرير
        doc.text("تقرير الحضور والغياب", 10, 10);

        // إضافة محتوى التقرير من الجدول
        let y = 20;
        doc.text("اسم الطالب | الصف | الشعبة | التاريخ | الحصة | الحالة", 10, y);
        y += 10;

        const rows = reportTableBody.querySelectorAll('tr');
        rows.forEach((row) => {
            const cells = row.querySelectorAll('td');
            const rowText = Array.from(cells).map(cell => cell.textContent).join(" | ");
            doc.text(rowText, 10, y);
            y += 10;
        });

        // تنزيل الملف
        doc.save('تقرير-الحضور-والغياب.pdf');
    }

    // ربط أزرار الطباعة وتنزيل PDF
    printButton.addEventListener('click', printReport);
    downloadButton.addEventListener('click', downloadPDF);

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
