package com.sms.service;

import com.sms.entity.PlacementReadiness;
import com.sms.entity.Student;
import com.sms.exception.ApiException;
import com.sms.repository.PlacementReadinessRepository;
import com.sms.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class PlacementService {
    private final PlacementReadinessRepository placementRepository;
    private final StudentRepository studentRepository;

    public PlacementService(PlacementReadinessRepository p, StudentRepository s) {
        placementRepository = p;
        studentRepository = s;
    }

    @Transactional
    public PlacementReadiness getOrCreateStudentReadiness(String email) {
        Student s = studentRepository.findByUserEmailIgnoreCase(email)
                .orElseThrow(() -> ApiException.notFound("Student"));

        return placementRepository.findByStudentId(s.getId()).orElseGet(() -> {
            PlacementReadiness pr = new PlacementReadiness();
            pr.setStudent(s);
            pr.setAptitudeScore(BigDecimal.valueOf(70.00));
            pr.setDsaScore(BigDecimal.valueOf(65.00));
            pr.setCodingScore(BigDecimal.valueOf(72.00));
            pr.setCommunicationScore(BigDecimal.valueOf(80.00));
            pr.setResumeScore(BigDecimal.valueOf(75.00));
            pr.setSkillsGap("Improve core DSA algorithms (trees, dynamic programming) and practice mock technical interviews.");
            pr.setInterviewProbability(BigDecimal.valueOf(68.50));
            return placementRepository.save(pr);
        });
    }

    public PlacementReadiness getStudentReadinessById(Long studentId) {
        Student s = studentRepository.findById(studentId)
                .orElseThrow(() -> ApiException.notFound("Student"));

        return placementRepository.findByStudentId(s.getId()).orElseGet(() -> {
            PlacementReadiness pr = new PlacementReadiness();
            pr.setStudent(s);
            pr.setAptitudeScore(BigDecimal.valueOf(60.00));
            pr.setDsaScore(BigDecimal.valueOf(60.00));
            pr.setCodingScore(BigDecimal.valueOf(60.00));
            pr.setCommunicationScore(BigDecimal.valueOf(70.00));
            pr.setResumeScore(BigDecimal.valueOf(65.00));
            pr.setSkillsGap("Complete basic programming problems and review resume formatting.");
            pr.setInterviewProbability(BigDecimal.valueOf(55.00));
            return pr;
        });
    }

    public Map<String, Object> getPlacementAnalytics() {
        List<PlacementReadiness> list = placementRepository.findAll();
        if (list.isEmpty()) {
            return Map.of(
                "avgAptitude", 0, "avgDsa", 0, "avgCoding", 0,
                "avgCommunication", 0, "avgResume", 0, "avgReadiness", 0,
                "totalReady", 0, "interviewSuccessProbability", 0
            );
        }

        BigDecimal sumApt = BigDecimal.ZERO;
        BigDecimal sumDsa = BigDecimal.ZERO;
        BigDecimal sumCod = BigDecimal.ZERO;
        BigDecimal sumCom = BigDecimal.ZERO;
        BigDecimal sumRes = BigDecimal.ZERO;
        BigDecimal sumProb = BigDecimal.ZERO;

        int readyCount = 0;
        for (PlacementReadiness pr : list) {
            sumApt = sumApt.add(pr.getAptitudeScore());
            sumDsa = sumDsa.add(pr.getDsaScore());
            sumCod = sumCod.add(pr.getCodingScore());
            sumCom = sumCom.add(pr.getCommunicationScore());
            sumRes = sumRes.add(pr.getResumeScore());
            sumProb = sumProb.add(pr.getInterviewProbability());

            BigDecimal readiness = pr.getAptitudeScore()
                    .add(pr.getDsaScore())
                    .add(pr.getCodingScore())
                    .add(pr.getCommunicationScore())
                    .add(pr.getResumeScore())
                    .divide(BigDecimal.valueOf(5), 2, RoundingMode.HALF_UP);

            if (readiness.compareTo(BigDecimal.valueOf(75.00)) >= 0) {
                readyCount++;
            }
        }

        int size = list.size();
        BigDecimal count = BigDecimal.valueOf(size);

        Map<String, Object> map = new HashMap<>();
        map.put("totalStudents", size);
        map.put("totalReady", readyCount);
        map.put("avgAptitude", sumApt.divide(count, 2, RoundingMode.HALF_UP));
        map.put("avgDsa", sumDsa.divide(count, 2, RoundingMode.HALF_UP));
        map.put("avgCoding", sumCod.divide(count, 2, RoundingMode.HALF_UP));
        map.put("avgCommunication", sumCom.divide(count, 2, RoundingMode.HALF_UP));
        map.put("avgResume", sumRes.divide(count, 2, RoundingMode.HALF_UP));

        BigDecimal totalSumScore = sumApt.add(sumDsa).add(sumCod).add(sumCom).add(sumRes);
        BigDecimal avgReadiness = totalSumScore.divide(BigDecimal.valueOf(5), 2, RoundingMode.HALF_UP).divide(count, 2, RoundingMode.HALF_UP);
        map.put("avgReadiness", avgReadiness);
        map.put("avgInterviewProbability", sumProb.divide(count, 2, RoundingMode.HALF_UP));

        return map;
    }
}
