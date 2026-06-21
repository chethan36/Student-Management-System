package com.sms.service;
import com.sms.entity.*;
import com.sms.exception.ApiException;
import com.sms.repository.*;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.*;
import java.util.List;
@Service @Transactional(readOnly=true)
public class StudentService {
 private final StudentRepository students;private final EnrollmentRepository enrollments;private final AttendanceRepository attendance;private final MarkRepository marks;
 public StudentService(StudentRepository s,EnrollmentRepository e,AttendanceRepository a,MarkRepository m){students=s;enrollments=e;attendance=a;marks=m;}
 public Student profile(String email){return students.findByUserEmailIgnoreCase(email).orElseThrow(()->ApiException.notFound("Student profile"));}
 public List<Enrollment> courses(String email){return enrollments.findByStudentId(profile(email).getId());}
 public List<Attendance> attendance(String email){return attendance.findByEnrollmentStudentId(profile(email).getId());}
 public List<Mark> marks(String email){return marks.findByEnrollmentStudentId(profile(email).getId());}
 public byte[] report(String email){var s=profile(email);try(var doc=new PDDocument();var out=new ByteArrayOutputStream()){var page=new PDPage();doc.addPage(page);try(var cs=new PDPageContentStream(doc,page)){var bold=new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);var normal=new PDType1Font(Standard14Fonts.FontName.HELVETICA);float y=750;cs.beginText();cs.setFont(bold,18);cs.newLineAtOffset(50,y);cs.showText("Student Report Card");cs.endText();y-=35;y=line(cs,normal,12,50,y,"Name: "+s.getName()+"    USN: "+s.getUsn());y=line(cs,normal,12,50,y,"Department: "+s.getDepartment().getName()+"    Semester: "+s.getSemester());y-=15;for(Mark m:marks(email)){y=line(cs,normal,11,50,y,m.getEnrollment().getCourse().getCode()+" - "+m.getAssessment()+": "+m.getScore()+"/"+m.getMaxScore()+"  Grade: "+(m.getGrade()==null?"-":m.getGrade()));if(y<60)break;}}doc.save(out);return out.toByteArray();}catch(IOException e){throw new IllegalStateException("Could not create report card",e);}}
 private float line(PDPageContentStream cs,PDType1Font font,float size,float x,float y,String text)throws IOException{cs.beginText();cs.setFont(font,size);cs.newLineAtOffset(x,y);cs.showText(text.replaceAll("[^\\x20-\\x7E]","?"));cs.endText();return y-22;}
}
