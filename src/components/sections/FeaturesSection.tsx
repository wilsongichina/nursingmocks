import GradeSlider from "./GradeSlider";

export default function FeaturesSection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Results From Previous Teas Exams
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Exam Results We Have Scored for Students Clients have consistently
            given Teas Gurus good feedback for the many years that we have been
            helping students with Teas Exams. One of the main reasons we have
            helped people finish degree programs and not just exams is because
            of this. You can have more faith in our "do my teas exam service"
            after seeing some actual grade results below.
          </p>
        </div>

        {/* Grade Slider */}
        <GradeSlider />
      </div>
    </section>
  );
}
