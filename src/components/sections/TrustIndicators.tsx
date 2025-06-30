export default function TrustIndicators() {
  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-lg card-shadow">
            <div className="text-4xl font-bold text-blue-600 mb-2">4.9</div>
            <div className="text-yellow-500 text-xl mb-2">★★★★★</div>
            <div className="text-gray-600">Student Satisfaction</div>
          </div>
          <div className="bg-white p-6 rounded-lg card-shadow">
            <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
            <div className="text-green-500 text-xl mb-2">Success Rate</div>
            <div className="text-gray-600">Pass Rate</div>
          </div>
          <div className="bg-white p-6 rounded-lg card-shadow">
            <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
            <div className="text-blue-500 text-xl mb-2">Students Helped</div>
            <div className="text-gray-600">Nationwide</div>
          </div>
        </div>
      </div>
    </section>
  );
}
