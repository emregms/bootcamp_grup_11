# SkillBridge Matcher Module
import numpy as np
from typing import Dict, List, Any

class SkillBridgeMatcher:
    def __init__(self):
        pass

    def _calculate_skill_similarity(self, mentee_skills: List[str], mentor_skills: List[str]) -> float:
        """Kısa kelimeleri (C, Go, AI) kaçırmayan tam ve kısmi küme eşleşmesi"""
        if not mentee_skills or not mentor_skills:
            return 0.0

        # Küçük harfe çevirip boşlukları temizleyelim
        mentee_set = {s.strip().lower() for s in mentee_skills if s}
        mentor_set = {s.strip().lower() for s in mentor_skills if s}

        if not mentee_set or not mentor_set:
            return 0.0

        # Birebir eşleşen beceriler
        exact_matches = mentee_set.intersection(mentor_set)
        
        # Menti beklentisinin ne kadarı karşılanıyor?
        match_ratio = len(exact_matches) / len(mentee_set)
        return float(match_ratio)

    def calculate_match_score(self, mentee: Dict[str, Any], mentor: Dict[str, Any]) -> Dict[str, Any]:
        # Veri güvenliği (None type kontrolü)
        m_req_skills = mentee.get("requested_skills") or []
        m_off_skills = mentor.get("offered_skills") or []
        
        # 1. BECERİ BENZERLİĞİ (%45 Ağırlık)
        skill_sim = self._calculate_skill_similarity(m_req_skills, m_off_skills)
        skill_score = skill_sim * 45.0

        # 2. AI QUIZ VE KALİTE SKORU (%25 Ağırlık)
        try:
            rating = float(mentor.get("quality_rating", 3.0))
        except (ValueError, TypeError):
            rating = 3.0
        rating_score = (min(max(rating, 0.0), 5.0) / 5.0) * 25.0

        # 3. TAKAS KREDİ DENGESİ (%15 Ağırlık)
        try:
            credits = float(mentor.get("credit_balance", 0))
        except (ValueError, TypeError):
            credits = 0.0
        credit_fairness_score = 15.0 / (1.0 + np.exp(credits / 50.0))

        # 4. TECRÜBE UYUMU (%10 Ağırlık)
        mentee_exp = mentee.get("experience_years") or 0
        mentor_exp = mentor.get("experience_years") or 0
        exp_diff = mentor_exp - mentee_exp
        exp_score = 10.0 if exp_diff >= 1 else 3.0

        # 5. DİL UYUMU (%5 Ağırlık)
        mentee_langs = set(mentee.get("languages") or [])
        mentor_langs = set(mentor.get("languages") or [])
        lang_score = 5.0 if mentee_langs.intersection(mentor_langs) else 0.0

        # TOPLAM HESAPLAMA
        total_score = skill_score + rating_score + credit_fairness_score + exp_score + lang_score

        return {
            "mentor_id": mentor.get("id"),
            "mentor_name": mentor.get("name", "Bilinmeyen Mentör"),
            "match_score": round(total_score, 2),
            "match_details": {
                "skill_match": round(skill_score, 2),
                "quality_rating_impact": round(rating_score, 2),
                "credit_fairness_impact": round(credit_fairness_score, 2),
                "experience_impact": round(exp_score, 2),
                "language_impact": round(lang_score, 2)
            }
        }


def main() -> None:
    mentee = {
        "id": 101,
        "requested_skills": ["Python", "AI", "Data Analysis"],
        "experience_years": 1,
        "languages": ["Turkish", "English"]
    }

    mentor = {
        "id": 501,
        "name": "Ezgi Mentor",
        "offered_skills": ["Python", "Machine Learning", "AI"],
        "quality_rating": 4.5,
        "credit_balance": 20,
        "experience_years": 3,
        "languages": ["English", "Turkish"]
    }

    matcher = SkillBridgeMatcher()
    result = matcher.calculate_match_score(mentee, mentor)

    print("=== SkillBridge Matcher Sonuç Örneği ===")
    print(f"Mentor ID: {result['mentor_id']}")
    print(f"Mentor Adı: {result['mentor_name']}")
    print(f"Eşleşme Skoru: {result['match_score']}")
    print("Detaylar:")
    for key, value in result["match_details"].items():
        print(f"  {key}: {value}")


if __name__ == "__main__":
    main()

