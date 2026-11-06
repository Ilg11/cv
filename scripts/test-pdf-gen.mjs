import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 20, marginBottom: 8, fontWeight: "bold" },
  section: { marginBottom: 12 },
});

const MyDoc = () => (
  React.createElement(Document, null,
    React.createElement(Page, { size: "A4", style: styles.page },
      React.createElement(View, null,
        React.createElement(Text, { style: styles.title }, "Test ATS PDF"),
        React.createElement(Text, null, "Alex Rivera - Senior Full Stack Engineer")
      )
    )
  )
);

async function testPdf() {
  const buffer = await renderToBuffer(React.createElement(MyDoc));
  console.log("PDF generated! Size:", buffer.byteLength, "Header:", buffer.slice(0, 4).toString());
}

testPdf().catch(console.error);
