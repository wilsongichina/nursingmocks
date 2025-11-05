import GradeSlider from "./GradeSlider";

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Results From Previous Teas Exams Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Proven TEAS Exam Results Geared Towards Enhancing Nursing Skills.
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            At Teas Gurus, our TEAS exam help platform has guided nursing students toward achieving their goals in every ATI subject tested. The results from previous exams show the skills, understanding, and dedication we bring to each program we assist with. For years, our nursing school support has provided an effective way for students to succeed in all four subjects of the TEAS exam that include Reading, Math, Science, and English Language Usage.
         </p>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
           We at Teas Gurus think that success is more than just passing the TEAS exam. It's about helping students reach their nursing goals, increasing their skills and confidence as they get closer to finishing their nursing school, and laying the groundwork for their careers. The positive feedback and excellent results we’ve received reflect the value of our work and the accuracy of our teaching methods. You can trust our TEAS exam help service to deliver real benefits and proven solutions at the best prices, giving every learner the support they deserve.
          </p>
        </div>

        {/* Grade Slider Section */}
        <div className="mb-16">
          <GradeSlider />
        </div>
      </div>
    </section>
  );
}
