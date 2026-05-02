// 20. PROFESYONEL PDF RAPOR ÇIKTISI
// ==========================================
const downloadPdfBtn = document.getElementById('download-pdf-btn');

if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', () => {
        if (transactions.length === 0) {
            showNotify("Rapor oluşturmak için veri bulunamadı!", "fa-circle-exclamation");
            return;
        }

        showNotify("Profesyonel Rapor hazırlanıyor...", "fa-spinner fa-spin");

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
        
        const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
        const monthData = transactions.filter(t => t.date.startsWith(prefix));
        const monthInc = monthData.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const monthExp = Math.abs(monthData.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
        const percent = monthInc > 0 ? Math.min((monthExp / monthInc) * 100, 100) : (monthExp > 0 ? 100 : 0);

        let yearlyRowsHtml = '';
        let yearlyTotalInc = 0, yearlyTotalExp = 0;

        monthNames.forEach((name, index) => {
            const mPrefix = `${year}-${String(index + 1).padStart(2, '0')}`;
            const mData = transactions.filter(t => t.date.startsWith(mPrefix));
            const inc = mData.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
            const exp = Math.abs(mData.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
            const net = inc - exp;
            yearlyTotalInc += inc; yearlyTotalExp += exp;

            yearlyRowsHtml += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 8px;">${name}</td>
                    <td style="padding: 8px;">${currentCurrency}${inc.toFixed(2)}</td>
                    <td style="padding: 8px;">${currentCurrency}${exp.toFixed(2)}</td>
                    <td style="padding: 8px; font-weight: bold; color: ${net >= 0 ? '#10b981' : '#ef4444'}">${currentCurrency}${net.toFixed(2)}</td>
                </tr>`;
        });

        const reportTemplate = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #1e293b; background: white; font-size: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #4a6cf7; padding-bottom: 15px; margin-bottom: 20px;">
                    <div>
                        <h1 style="color: #4a6cf7; margin: 0; font-size: 18px;">FİNANSAL DURUM RAPORU</h1>
                        <p style="color: #64748b; margin: 4px 0 0 0; font-size: 11px;">Oluşturma Tarihi: ${today.toLocaleDateString('tr-TR')}</p>
                    </div>
                    <div style="text-align: right;">
                        <h2 style="margin: 0; color: #1e293b; font-size: 16px;">${year} YILI</h2>
                    </div>
                </div>

                <div style="margin-bottom: 25px;">
                    <h3 style="color: #4a6cf7; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px; font-size: 14px;">Aylık Harcama Durumu (${monthNames[month]})</h3>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: bold; font-size: 12px;">
                            <span>Toplam Gider: ${currentCurrency}${monthExp.toFixed(2)}</span>
                            <span>Toplam Gelir: ${currentCurrency}${monthInc.toFixed(2)}</span>
                        </div>
                        <div style="height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden;">
                            <div style="height: 100%; width: ${percent}%; background: ${percent > 90 ? '#ef4444' : (percent > 60 ? '#f59e0b' : '#10b981')};"></div>
                        </div>
                        <p style="margin-top: 6px; font-size: 10px; color: #64748b; text-align: right; margin-bottom: 0;">
                            Bütçe Kullanım Oranı: %${percent.toFixed(1)}
                        </p>
                    </div>
                </div>

                <div>
                    <h3 style="color: #4a6cf7; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px; font-size: 14px;">Yıllık Finansal Özet</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                        <thead>
                            <tr style="background: #f1f5f9; text-align: left;">
                                <th style="padding: 8px; border: 1px solid #e2e8f0;">Ay</th>
                                <th style="padding: 8px; border: 1px solid #e2e8f0;">Gelir</th>
                                <th style="padding: 8px; border: 1px solid #e2e8f0;">Gider</th>
                                <th style="padding: 8px; border: 1px solid #e2e8f0;">Net Durum</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${yearlyRowsHtml}
                        </tbody>
                        <tfoot style="background: #f8fafc; font-weight: bold; border-top: 2px solid #4a6cf7;">
                            <tr>
                                <td style="padding: 8px; border: 1px solid #e2e8f0;">TOPLAM</td>
                                <td style="padding: 8px; border: 1px solid #e2e8f0;">${currentCurrency}${yearlyTotalInc.toFixed(2)}</td>
                                <td style="padding: 8px; border: 1px solid #e2e8f0;">${currentCurrency}${yearlyTotalExp.toFixed(2)}</td>
                                <td style="padding: 8px; border: 1px solid #e2e8f0; color: ${(yearlyTotalInc - yearlyTotalExp) >= 0 ? '#10b981' : '#ef4444'}">
                                    ${currentCurrency}${(yearlyTotalInc - yearlyTotalExp).toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px;">
                    Bu belge FinansTracker asistanınız tarafından dijital olarak üretilmiştir.
                </div>
            </div>
        `;

        const opt = {
            margin:       10, 
            filename:     `Finans_Ozet_Raporu_${year}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, backgroundColor: '#ffffff' },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(reportTemplate).save().then(() => {
            showNotify("Profesyonel PDF Rapor İndirildi!", "fa-file-pdf");
        });
    });
}

