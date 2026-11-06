import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { ResumeContent } from "./schema";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    lineHeight: 1.35,
    color: "#1e293b",
  },
  header: {
    textAlign: "center",
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 10,
  },
  name: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    color: "#0f172a",
    marginBottom: 3,
  },
  headline: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Oblique",
    color: "#475569",
    marginBottom: 5,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    fontSize: 8.5,
    color: "#64748b",
  },
  contactItem: {
    marginHorizontal: 3,
  },
  section: {
    marginBottom: 11,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#0f172a",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 2,
    marginBottom: 6,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
  },
  itemTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    color: "#0f172a",
  },
  itemSubtitle: {
    fontFamily: "Helvetica",
    color: "#475569",
  },
  itemDate: {
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: "#64748b",
  },
  bulletList: {
    marginTop: 2,
    marginBottom: 4,
    paddingLeft: 8,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bulletDot: {
    width: 8,
    fontSize: 9,
    color: "#64748b",
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.3,
    color: "#334155",
  },
  skillsGroup: {
    flexDirection: "row",
    marginBottom: 3,
    fontSize: 9,
  },
  skillGroupName: {
    fontFamily: "Helvetica-Bold",
    width: 90,
    color: "#0f172a",
  },
  skillGroupItems: {
    flex: 1,
    color: "#334155",
  },
});

export function AtsPdfDocument({ content, title }: { content: ResumeContent; title?: string }) {
  const { basics, experience, education, skills, projects, certifications } = content;

  return (
    <Document title={title || basics?.fullName || "Resume"} author={basics?.fullName || "Candidate"}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{basics?.fullName || "Your Full Name"}</Text>
          {basics?.headline ? <Text style={styles.headline}>{basics.headline}</Text> : null}
          <View style={styles.contactRow}>
            {basics?.email ? <Text style={styles.contactItem}>{basics.email}</Text> : null}
            {basics?.phone ? <Text style={styles.contactItem}>• {basics.phone}</Text> : null}
            {basics?.location ? <Text style={styles.contactItem}>• {basics.location}</Text> : null}
            {basics?.linkedinUrl ? <Text style={styles.contactItem}>• {basics.linkedinUrl}</Text> : null}
            {basics?.website ? <Text style={styles.contactItem}>• {basics.website}</Text> : null}
          </View>
        </View>

        {/* Summary */}
        {basics?.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={{ fontSize: 9, lineHeight: 1.35, color: "#334155" }}>{basics.summary}</Text>
          </View>
        ) : null}

        {/* Experience */}
        {experience && experience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={{ marginBottom: 6 }}>
                <View style={styles.itemRow}>
                  <Text>
                    <Text style={styles.itemTitle}>{exp.title}</Text>
                    <Text style={styles.itemSubtitle}> — {exp.company}</Text>
                    {exp.location ? <Text style={{ color: "#64748b", fontSize: 8.5 }}> ({exp.location})</Text> : null}
                  </Text>
                  <Text style={styles.itemDate}>
                    {exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate || "Present"}
                  </Text>
                </View>
                {exp.bullets && exp.bullets.length > 0 ? (
                  <View style={styles.bulletList}>
                    {exp.bullets.map((bullet, idx) => (
                      <View key={idx} style={styles.bulletItem}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>{bullet}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Education */}
        {education && education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu) => (
              <View key={edu.id} style={{ marginBottom: 4 }}>
                <View style={styles.itemRow}>
                  <Text>
                    <Text style={styles.itemTitle}>{edu.school}</Text>
                    {edu.degree || edu.field ? (
                      <Text style={styles.itemSubtitle}> — {edu.degree} {edu.field ? `in ${edu.field}` : ""}</Text>
                    ) : null}
                  </Text>
                  <Text style={styles.itemDate}>
                    {edu.startDate} {edu.endDate ? `- ${edu.endDate}` : ""}
                  </Text>
                </View>
                {edu.details ? (
                  <Text style={{ fontSize: 8.5, color: "#64748b", marginTop: 1 }}>{edu.details}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Skills */}
        {skills && skills.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {skills.map((grp) => (
              <View key={grp.id} style={styles.skillsGroup}>
                <Text style={styles.skillGroupName}>{grp.group}:</Text>
                <Text style={styles.skillGroupItems}>
                  {Array.isArray(grp.items) ? grp.items.join(", ") : ""}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Projects */}
        {projects && projects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((proj) => (
              <View key={proj.id} style={{ marginBottom: 4 }}>
                <View style={styles.itemRow}>
                  <Text style={styles.itemTitle}>{proj.name}</Text>
                  {proj.url ? <Text style={styles.itemDate}>{proj.url}</Text> : null}
                </View>
                {proj.description ? (
                  <Text style={{ fontSize: 8.5, color: "#475569", marginBottom: 2 }}>{proj.description}</Text>
                ) : null}
                {proj.bullets && proj.bullets.length > 0 ? (
                  <View style={styles.bulletList}>
                    {proj.bullets.map((b, i) => (
                      <View key={i} style={styles.bulletItem}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>{b}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Certifications */}
        {certifications && certifications.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {certifications.map((cert) => (
              <View key={cert.id} style={styles.itemRow}>
                <Text>
                  <Text style={styles.itemTitle}>{cert.name}</Text>
                  {cert.issuer ? <Text style={styles.itemSubtitle}> — {cert.issuer}</Text> : null}
                </Text>
                {cert.date ? <Text style={styles.itemDate}>{cert.date}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

export async function generateResumePdfBuffer(content: ResumeContent, title?: string): Promise<Buffer> {
  return await renderToBuffer(<AtsPdfDocument content={content} title={title} />);
}
