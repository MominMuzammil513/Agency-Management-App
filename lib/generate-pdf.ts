import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface OrderDetail {
  id: string;
  shopName: string;
  areaName: string;
  createdAt: string | Date | null;
  items: { productName: string; quantity: number; price: number }[];
  totalAmount: number;
}

export const generatePDF = (
  orders: OrderDetail[],
  title: string = "Order Summary"
) => {
  const doc = new jsPDF();

  orders.forEach((order, index) => {
    if (index > 0) doc.addPage(); // New page for each order

    // 🟢 Header (Professional Bill Style)
    doc.setFillColor(16, 185, 129); // Emerald Color
    doc.rect(0, 0, 210, 40, "F");

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("INVOICE", 14, 25);

    doc.setFontSize(10);
    doc.text("Euro India Foods Agency", 150, 20, { align: "right" });
    doc.text("Authorized Distributor", 150, 25, { align: "right" });

    // 🟢 Bill To Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Bill To: ${order.shopName}`, 14, 55);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Area: ${order.areaName}`, 14, 60);
    doc.text(`Order ID: #${order.id.slice(0, 8).toUpperCase()}`, 14, 65);
    doc.text(
      `Date: ${new Date(order.createdAt!).toLocaleDateString()}`,
      14,
      70
    );

    // 🟢 Items Table
    const tableBody = order.items.map((item) => [
      item.productName,
      item.quantity,
      `Rs. ${(item.price / item.quantity).toFixed(2)}`, // Unit Price
      `Rs. ${item.price}`, // Total
    ]);

    autoTable(doc, {
      startY: 80,
      head: [["Item Description", "Qty", "Rate", "Amount"]],
      body: tableBody,
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 3 },
      foot: [["", "", "Grand Total:", `Rs. ${order.totalAmount}`]],
      footStyles: {
        fillColor: [240, 253, 244],
        textColor: 0,
        fontStyle: "bold",
      },
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for your business!", 105, finalY, { align: "center" });
  });

  doc.save(
    `${title.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`
  );
};
