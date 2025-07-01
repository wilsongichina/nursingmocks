import Link from "next/link";

export default function AdditionalContentSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Content Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-6">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
            Expert TEAS Exam Services
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Take My Teas Exam for Me from Our Best Tutors
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Searching for pay someone to take my teas exam for me? We get it.
            Teas exams sometimes feel like an overwhelming beast, especially
            when juggling work and school, and you just wish for a little extra
            help to tame it, even at a small price. That's where we come in.
            Whether you are cramming last minute or just need someone to guide
            you through months of prep, our Teas exams help services are here to
            save the day!
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Why Choose Our TEAS Exam Service?
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Now, you are probably wondering what's special about our Teas
                exam service. Well, it's simple. Our team experts are dedicated
                to giving you any support you need, taking the test exams on
                your behalf, and helping you meet the deadlines. If you ask for
                it, our hands and minds are open and ready to help you. Tired of
                low grades? Let us help you raise them. No time for taking the
                Teas exams? Worry less; We've got you.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                You can count on us as we have worked with thousands of students
                across the globe, and we have sufficient U.S.-based
                professionals. We understand that current life is so demanding,
                there are moments when classes become stressful, to the point
                you can't take them anymore. Smart students (like you) always
                choose to pay someone to take their online classes and exams for
                them.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Why us? Our Teas exams support team is made of seasoned
                professionals who have been there and done that. So, we are not
                just throwing random advice at you; we know exactly what works.
                We have years of experience, and the help and services we offer
                assure you peace of mind. It allows you to relax and focus
                better on your work, knowing you got a good grade, but with less
                hassle, just like a ton of students who have aced their Teas
                exam with our help.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
              <h3 className="text-2xl font-bold mb-4">
                What You Can Expect From Us
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h4 className="font-semibold mb-2 text-white">
                    High-quality work
                  </h4>
                  <p className="text-blue-100 text-sm">Exceptional standards</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h4 className="font-semibold mb-2 text-white">
                    Well-researched material
                  </h4>
                  <p className="text-blue-100 text-sm">Thorough preparation</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h4 className="font-semibold mb-2 text-white">
                    High score, at least 90
                  </h4>
                  <p className="text-blue-100 text-sm">Guaranteed results</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-white bg-opacity-10 rounded-lg">
                <p className="text-center font-semibold text-gray-700">
                  100% Refund if we deliver anything short of our promises. With
                  us, you have nothing loose!
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & CTA */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Why Us?</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Our Teas exams support team is made of seasoned professionals
                who have been there and done that. So, we are not just throwing
                random advice at you; we know exactly what works. We have years
                of experience, and the help and services we offer assure you
                peace of mind.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Years of experience</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Proven track record</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Peace of mind guarantee</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-6 text-gray-900 shadow-lg">
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Ready to Get Started?
              </h3>
              <p className="text-gray-800 mb-4">
                Join thousands of students who have successfully passed the TEAS
                exam with our proven approach.
              </p>
              <Link
                href="/contact"
                className="block w-full bg-gray-900 text-white text-center py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Get Started Today
              </Link>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-12">
          {/* Section 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-3">
                  We Are Teas Gurus
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  We Settle For At least a 90 In Your Teas Exam
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    TEAS tests can sometimes be nerve-wracking, with the
                    deadlines and pressure to do better in terms of grades. When
                    your inbox is flooded with reminders, and the stress from
                    exams and work comes in, you can count on us, and at a small
                    fee, we take this load off your shoulders. See, with us, we
                    don't just aim to make the work easier for you by taking the
                    TEAS exam on your behalf; we also want to ensure you get the
                    best score.
                  </p>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    We understand that exam performance has a direct impact on
                    your GPA, and therefore, it is important to get the best
                    score, which we figure would be at least 90. We settle for
                    nothing less. Let's make your days in university a breeze.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    To ensure you get the best as astudent, we recommend you
                    share with us all the necessary information about your TEAS
                    exams. This will help us assign your exam to the right
                    specialist who will be certain to give you quality work and
                    the best results. Rest assured, your progress is vital to
                    us, and that's why we have our support team ready and
                    available any time of the day to give you updates on your
                    exam.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-gray-900 font-bold text-lg">2</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center px-3 py-1 bg-yellow-500 bg-opacity-20 text-gray-900 rounded-full text-sm font-semibold mb-3">
                  We Are Teas Gurus
                </div>
                <h2 className="text-3xl font-bold mb-4 text-white">
                  Teas Exam Takers by Top Qualified MSN Tutors
                </h2>
                <div className="prose prose-lg max-w-none prose-invert">
                  <p className="text-gray-200 mb-4 leading-relaxed">
                    Every day, we get inquiries from students all over the
                    country enquiring about our services with questions like
                    "Can I hire someone to take my TEAS tests?", "How can
                    someone take my TEAS exam for me?" Our tutors specialize in
                    all areas of TEAS exams, from reading, math, science, and
                    English, and offer targeted, effective tutoring that will
                    surely boost your score.
                  </p>
                  <p className="text-gray-200 leading-relaxed">
                    Our tutors are not just experts; they are specialized
                    professionals with a proven track record of success. We
                    ensure you get the best by meticulously matching you with
                    the perfect tutor based on your academic background and area
                    of expertise. They are reputable professionals from renowned
                    universities, and they are available to handle even tasks
                    with close deadlines without compromising the quality or the
                    score.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">3</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-3">
                  We Are Teas Gurus
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Should I Pay Someone to Do My Teas Exam for Me?
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Paying someone to do the TEAS exam for you brings you a step
                    closer to your dream. See, the issue with fixed/tight
                    schedules, anxiety, procrastination, and struggling with the
                    class easily distance you from your dreams. But we come as a
                    solution to this problem, with only a small price to pay.
                  </p>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    You get expert assistance, which means you tap into proven
                    strategies and insights that will undoubtedly boost your
                    performance on your TEAS exams. Also, by paying someone to
                    do this exam for you, you are investing in professional help
                    and avoiding the pressure of studying, which can be quite
                    overwhelming.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    You do not need to deal with the stress of trying to master
                    the materials when you are already feeling burned out from
                    days/nights at work. We are here and always available to do
                    all the hard work for you while you rest and re-energize for
                    the next shift.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-lg">4</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center px-3 py-1 bg-white bg-opacity-20 text-purple-600 rounded-full text-sm font-semibold mb-3">
                  We Are Teas Gurus
                </div>
                <h2 className="text-3xl font-bold mb-4 text-white">
                  Take My Teas Test for Me by Qualified and Professional MSN
                  Tutors
                </h2>
                <div className="prose prose-lg max-w-none prose-invert">
                  <p className="text-gray-200 mb-4 leading-relaxed">
                    If you feel stressed about your TEAS exam or ever wish you
                    could just hit a button and someone handle it for you, rest
                    easy because now, you can! All you need to do is share your
                    online coursework with us, and our qualified and
                    professional MSN tutors will do all the heavy lifting. You
                    don't need to spend so much on books; you can just let us
                    take care of your online TEAS tests and have more time to
                    spend with your loved ones.
                  </p>
                  <p className="text-gray-200 leading-relaxed">
                    With us, there are no gimmicks or games. We do not take
                    lightly the trust you have in us. Here, you get a tutor and
                    a partner in your academic success. The assigned tutor will
                    take your online TEAS exams and ensure you achieve the score
                    needed to advance in your nursing career. They understand
                    the exam's format and use their extensive knowledge to
                    navigate the questions effectively to ensure you get that
                    coveted score of 90 and above.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold text-lg">5</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold mb-3">
                  We Are Teas Gurus
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  What Is in The Space of Hiring an Expert to Take My Teas Exam?
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Hiring us to take TEAS exam can be a tempting solution, but
                    have no doubts as there are many factors, to take into
                    consideration to ensure you get the score we promise. First,
                    our tutors work on a schedule, and while they have proven
                    expertise in TEAS material, it's essential to provide all
                    that your class needs. Also, entrust us with your class as
                    early as possible to ease the path to good scores.
                  </p>
                  <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Important Note:
                    </h4>
                    <p className="text-blue-800">
                      Be sure to also give us a considerable period to provide
                      you with the best of our services. Online exams can vary,
                      and therefore, depending on the nature of the task/exam,
                      we will need ample time to take your online class and give
                      you the best score. But if you need a quick order, contact
                      us and fill out our quote. We will only accept it if there
                      is enough time to handle it before its deadline.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Final Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl text-center">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center px-3 py-1 bg-white bg-opacity-20 text-gray-700 rounded-full text-sm font-semibold mb-4">
                We Are Teas Gurus
              </div>
              <h2 className="text-3xl font-bold mb-4 text-white">
                So, Can You Take My Remote Teas Exam?
              </h2>
              <p className="text-xl text-blue-100 mb-6 leading-relaxed">
                Absolutely! Our team has qualified professionals ready to take
                your ream TEAS exams for you. They are knowledgeable of these
                exams' content and format; hence, you can be sure they will
                deliver exceptional results. We prioritize your success and
                maintaining high ethical standards, so have no doubt in our
                support. Wait no more; reach out today and let us help you
                achieve that high score you need.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-400 transition-colors shadow-lg"
                >
                  Get Started Today
                </Link>
                <Link
                  href="/services"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
