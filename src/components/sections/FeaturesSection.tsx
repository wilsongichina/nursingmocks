import GradeSlider from "./GradeSlider";

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Results From Previous Teas Exams Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Results From Previous Teas Exams
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Exam Results We Have Scored for Students Clients have consistently
            given Teas Gurus good feedback for the many years that we have been
            helping students with Teas Exams. One of the main reasons we have
            helped people finish degree programs and not just exams is because
            of this. You can have more faith in our "do my teas exam service"
            after seeing some actual grade results below.
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
