package com.pedidos.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.pedidos.dto.PedidoConClienteDTO;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class BoletaGeneratorService {

    public byte[] generarBoletaPDF(PedidoConClienteDTO pedido) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document();
            PdfWriter.getInstance(doc, baos);
            doc.open();

            doc.add(new Paragraph("Boleta de Compra", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16)));
            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("Cliente: " + pedido.cliente().nombre()));
            doc.add(new Paragraph("Teléfono: " + pedido.cliente().telefono()));
            doc.add(new Paragraph("Email: " + pedido.cliente().email()));
            doc.add(new Paragraph("Dirección: " + pedido.direccion()));
            doc.add(new Paragraph("Referencia: " + pedido.referencia()));
            doc.add(new Paragraph("Fecha: " + pedido.fecha()));
            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("Estado: " + pedido.estado()));
            doc.add(new Paragraph(" "));

            PdfPTable tabla = new PdfPTable(4);
            tabla.addCell("Producto");
            tabla.addCell("Cantidad");
            tabla.addCell("Precio Unitario");
            tabla.addCell("Subtotal");

            for (var item : pedido.items()) {
                tabla.addCell(item.nombreProducto());
                tabla.addCell(String.valueOf(item.cantidad()));
                tabla.addCell("S/ " + item.precioUnit());
                tabla.addCell("S/ " + item.subtotal());
            }

            doc.add(tabla);
            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("TOTAL A PAGAR: S/ " + pedido.total()));

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar PDF", e);
        }
    }
}
