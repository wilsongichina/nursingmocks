import { Metadata } from "next";
import Layout from "@/components/layout/Layout";
import ContactForm from "@/components/ui/ContactForm";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions - TEAS Gurus",
  description:
    "Read our terms and conditions to understand the complete agreement for using our TEAS exam services and support.",
  keywords:
    "terms and conditions, TEAS exam terms, service agreement, terms of service, TEAS service terms",
  openGraph: {
    title: "Terms and Conditions - TEAS Gurus",
    description:
      "Read our terms and conditions to understand the complete agreement for using our TEAS exam services.",
    url: "https://teasgurus.com/terms-of-service",
  },
  alternates: {
    canonical: "/terms-of-service",
  },
};

export default function TermsOfServicePage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Terms and Conditions" },
              ]}
              className="text-white"
            />
          </div>

          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              We are Teas Gurus
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              TERMS AND CONDITIONS
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
              Your use of this Website constitutes your agreement with the terms
              and conditions as stated below.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/privacy-policy"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Terms and Conditions Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6 leading-relaxed">
              Your use of this Website constitutes your agreement with the terms
              and conditions as stated below. If you disagree with any of these
              terms and conditions, do not use this Website.
            </p>

            <p className="text-gray-600 mb-6 leading-relaxed">
              If you are an under 13 years old, you are not allowed to access or
              use this Website. You further acknowledge and agree that you must
              be of legal age to purchase any of our products or services
              available on this website.
            </p>

            <p className="text-gray-600 mb-6 leading-relaxed">
              By submitting the order form and/or payment, you confirm that you
              have fully read, understand and agree to be legally bound by these
              terms and conditions, which form the entire agreement between Teas
              Gurus and You.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              INTERPRETATION
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              In this document:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-2">
              <li>"Website" means Teas Gurus</li>
              <li>
                "Customer", "You" or "Yours" mean and refer to you and/or any
                other person submitting the Order to the Website on your behalf.
              </li>
              <li>
                "Product" refers to an original essay, paper, and/or other
                written Product that is drafted and delivered to the Customer in
                accordance with his/her Order.
              </li>
              <li>
                "Order" means a written order of a standard electronic form that
                is filled in and submitted online by the Customer to Our
                Website. Order specifies the scope of work and other
                requirements of the Customer regarding the Product.
              </li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              OUR SERVICES
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              By submitting an Order and/or payment, You are purchasing the
              Product for Your personal, noncommercial use only. All Products
              are drafted by freelance writers who transferred all rights and
              ownership regarding the Products to the Company.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              It is Your obligation to read this Terms and Conditions page
              before submitting any Order and/or payment to this Website.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">REFUNDS</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              The Products are refundable only in the cases, stated in the
              "Money Back Guarantee" document. Please view it for additional
              information on this issue. Mind that if you live on the territory
              of the European Union and paid VAT in the process of payment
              transaction, you do not receive it back with a refund. You get
              back only the money or a percent of the price stated in the Prices
              section of the website. VAT is non-refundable.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              COPYRIGHT & PERSONAL USE
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              The Products delivered to You are completely original. The full
              copyright to the Products and other materials delivered to You is
              retained by the Company and/or its affiliates and partners.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Your use of the delivered Products and other materials available
              from this Website is for Your personal, noncommercial use only.
              You shall not distribute, publish, transmit, modify, display or
              create derivative works from or exploit the Products and/or
              contents of this Website without the prior written consent of the
              Company. You shall indemnify, defend and hold harmless the Company
              for any and all unauthorized uses You may make of any material
              available from this Website. Any unauthorized use of the delivered
              Products and/or content of this Website may subject You to civil
              or criminal penalties.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              NO PLAGIARISM
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              You acknowledge that the Company reserves the right to cancel any
              agreement, contract or arrangement with any person who condones or
              attempts to pass plagiarized Product as original when asking for
              editing or proofreading. You also agree that any Product delivered
              by the Company may not be passed to third parties or distributed
              in any way for payment or for any other purpose. You also
              acknowledge that if the Company suspects that the delivered
              Product has been distributed or has been used by You in any form
              of plagiarism, the Company reserves the right to refuse to carry
              out any further work and services for You and subject You to
              criminal or civil penalties.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              You may not put Your name on the delivered Product. All Products
              and/or other written materials delivered to You are for research
              and/or reference only. We do not condone, encourage, or knowingly
              take part in plagiarism or any other acts of academic fraud or
              dishonesty. We strongly adhere to and abide by all copyright laws,
              and will not knowingly allow any Customer to commit plagiarism or
              violate copyright laws. You agree that any Product and/or other
              written material delivered to You is provided only as a model,
              example document for research use, and any text and/or ideas from
              Our document that You borrow, reference, refer to, or otherwise
              use in any way in Your own original paper must be properly cited
              and attributed to this Website.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Neither the Company nor any of its affiliates and/or partners
              shall be liable for any unethical, inappropriate, illegal, or
              otherwise wrongful use of the Products and/or other written
              material received from Our Website. This includes plagiarism,
              lawsuits, poor grading, expulsion, academic probation, loss of
              scholarships/awards/grants/prizes/titles/positions, failure,
              suspension, or any other disciplinary or legal actions. The buyer
              of material from Our Website is solely responsible for any and all
              disciplinary actions arising from the improper, unethical, and/or
              illegal use of the material.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Plagiarism level that is regarded as acceptable by us is below
              10%. In case plagiarism level is higher, You have the right to ask
              for revision or refund. For additional information considering
              these issues, You are free to view Our Money Back Guarantee and
              Revision Policy. Please mind that bibliographical references
              (in-text referencing and bibliography page at the end of the
              papers) and clichéd phrases (idioms, standard phrases, connectors
              and other frequently used phrases) shall not be regarded as
              plagiarism and shall not be included in the plagiarism level
              calculation.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              OUR GUARANTEES
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We guarantee that the paper's plagiarism level is lower than 10%
              (not including bibliographical references and clichéd phrases);
              that We follow all Your instructions; that We follow the
              formatting requirements that You state; that We conduct the
              necessary research; that We comply with the formal standard
              English style.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We don't guarantee any particular grade and You cannot ask for
              refund in case You received an unsatisfactory mark.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              ORDER PLACEMENT
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              When You decide to place an Order or inquiry on the Website, You
              agree to fill in an online form. There, You will be asked to
              provide certain personal information necessary to perform the
              Order. The Company shall on no condition disclose the information
              to third parties. For further reference please view Our "Privacy
              Policy"
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Mind that Your email address will be used to send You
              notifications considering the most important stages of Order
              fulfillment, such as clarification of any issues, unread messages
              and Order completion.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Note that Your email address will be used to send You
              notifications about the most important stages of Order fulfillment
              such as clarification of any issues, unread messages, and Order
              completion. Your email and telephone number may also be used for
              promotional and marketing purposes, to notify You of special
              offers and discounts, etc.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              As soon as You complete the form, the price for Your Order will be
              calculated on the basis of deadline, type of work and academic
              level. The deadline timer will start counting down only after You
              perform the payment.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              FEES & PAYMENT
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Company's charges for the services provided are shown on the
              Company's Website. You should bear in mind that VAT is not
              included in the prices listed. It is charged only to customers
              from the European Union. It will be added to the cost of the order
              in the process of payment transaction. VAT is non-refundable.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              If a Customer requires a type of work that cannot be classified as
              a regular type of services provided on the Company's Website or if
              a Customer requires the completed Product to be amended in a way
              that is inconsistent with the initial Order instructions, a
              Company may set own rate for delivery of the Service.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              A Customer is invited to pay for the Order in advance, given the
              Company is reasonably confident that it is able to allocate a
              freelance writer to deliver the Product. If payment in advance has
              been provided, but the Company was not able to allocate a
              freelance writer to deliver the work, a full refund of the payment
              made in advance will be provided. Other cases of refunds are
              described in the "Money Back Guarantee" document.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              PAYMENT VERIFICATION
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              The Company can request for verification of a Customer's account
              to prevent any fraudulent activity on the Website. You will be
              requested to send a scan or a picture of an identity document
              (passport, driver's licence, student's card, etc.) and of a credit
              card that was used for the payment.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We only need to check 4 last digits of the credit card, name on
              the card and the expiration date. All other information can be
              covered. Only your name should be visible on your ID, all other
              information can be covered.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Once the documents are received, they are checked by the Risk
              Department and are erased from the system immediately.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              DELIVERY OF COMPLETED PRODUCT
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Upon completion, a Product is available for preview by the
              Customer in his personal account panel on the Website. If the work
              meets the Customer's expectations, he can press the "Approve"
              button and download the completed work. Please note that you may
              not download or use the final Word document until the order is
              Approved.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              After the Customer presses the "Approve" button, he is allowed to
              ask for a free revision only within 7 days. For additional
              information please consult Our "Revision Policy" document. After
              the Customer presses the "Approve" button, he is not able to ask
              for any refund.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              If a Customer does not receive a completed Product by the
              deadline, a certain amount of refund will be made. For further
              information on this question, view Our "Money Back Guarantee"
              document.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              The Company will not be liable for any delays or technical
              problems in the delivery of the Product resulting from any
              malfunction of the customer's mail-server or the customer's
              Internet Service Provider.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Please note that You have 7 days to approve Your Order. The paper
              (or its part) will be approved automatically after the end of the
              approval period, which is calculated from the moment the last
              version was uploaded to your personal account and according to the
              deadline
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              FREE REVISION GUARANTEE
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Free revisions are possible only in cases stated in the "Revision
              Policy" Please view it for further information on this issue.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              PRIVACY & SECURITY
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              For an explanation of the Company's practices and policies related
              to the collection, use and storage of the online guests'
              information, please read Our "Privacy Policy".
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We may use any contact information (emails and phone numbers)
              submitted to this Website for the purposes stated in the "Order
              placement" paragraph of this document. If You would like to opt
              out of emails and SMS notifications from Us, please let Us know by
              contacting us. After We receive Your request, We will stop sending
              You messages immediately.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              WARRANTIES
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              By submitting the Order and/or payment, You acknowledge that You
              are in complete understanding and agreement with the statements
              above, as well as each of the following:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-2">
              <li>
                Any information and/or ideas used from the Product must be
                properly cited.
              </li>
              <li>
                All Products are provided solely as examples to research,
                reference, and/or for you to learn how to properly write a paper
                in a particular citation style (MLA, APA, Chicago, Turabian,
                Harvard, etc.).
              </li>
              <li>
                All Products were acquired from freelance writers who
                transferred all rights and ownership to the Company and/or its
                affiliates and partners.
              </li>
              <li>
                You are in agreement that this Website is acquiring payment for
                the time and effort that goes into gathering, organizing,
                correcting, editing, posting, and delivering these reference
                materials and the maintenance, administration, and advertising
                of this Website for educational access.
              </li>
              <li>
                To make a request to us for any personal information we may need
                you to put the request in writing addressing it to our Customer
                Support Representatives via email. If you agree, we will try to
                deal with your request informally, for example by providing you
                with the specific information you need over the telephone. If we
                do hold information about you, you can ask us to correct any
                mistakes by, once again, contacting Customer Support
                Representatives.
              </li>
              <li>
                Aside from a reasonable number of copies for personal,
                non-commercial use, You may not otherwise reproduce, distribute,
                publish, transmit, modify, display or create derivative works
                from or exploit the Products and/or contents of this Website
                without the prior written consent of the Company.
              </li>
              <li>
                You agree to destroy all delivered Products immediately after
                Your research/reference use of the material is complete. No
                copies shall be made for distribution, and no parts of any
                Product shall be used without proper citation.
              </li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              SEVERABILITY
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              It is understood and agreed by the Customer that if any part,
              term, or provision of this Agreement is held by the courts to be
              illegal or in conflict with any law of the state where made, the
              validity of the remaining portions or provisions shall not be
              affected, and the rights and obligations of the Customer shall be
              construed and enforced as if the Agreement did not contain the
              particular part, term, or provision held to be invalid.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              LAW GOVERNING
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              It is mutually understood and agreed that this Agreement shall be
              governed by the laws of the place where the Company holds its
              principal place of business, both as to interpretation and
              performance, or in any other place at the determination of the
              Company.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              PLACE OF SUIT
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Any action or other judicial proceeding for the enforcement of
              this Agreement or any of its provisions shall be instituted in the
              courts of competent jurisdiction in the place where the Company
              holds its principal place of business or in any other place at the
              determination of the Company.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              LIMITATION OF LIABILITY
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              You agree to release and hold the Company and its employees,
              officers, directors, shareholders, agents, representatives,
              affiliates, subsidiaries, advertising, promotion and fulfillment
              agencies, any third-party providers or sources of information or
              data and legal advisers (the "Company's Affiliates") harmless from
              any and all losses, damages, rights, claims, and actions of any
              kind arising from or related to the Products, including but not
              limited to: (a) telephone, electronic, hardware or software,
              network, Internet, email, or computer malfunctions, failures or
              difficulties of any kind; (b) failed, incomplete, garbled or
              delayed computer transmissions; (c) any condition caused by events
              beyond the control of the Company that may cause the Product to be
              delayed, disrupted, or corrupted; (d) any injuries, losses or
              damages of any kind arising in connection with or as a result of
              utilizing Our services; or (e) any printing or typographical
              errors in any materials associated with Our services. In addition,
              You agree to defend, indemnify, and hold the Company harmless from
              any claim, suit or demand, including attorney's fees, made by a
              third party due to or arising out of Your utilizing of Our
              services, Your violation or breach of these Terms and Conditions,
              Your violation of any rights of a third party, or any other act or
              omission by You.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              IN NO EVENT SHALL THE COMPANY BE LIABLE FOR ANY DIRECT, INDIRECT,
              PUNITIVE, INCIDENTAL, SPECIAL OR CONSEQUENTIAL DAMAGES ARISING OUT
              OF OR IN ANY WAY CONNECTED WITH THE USE OF THIS WEBSITE OR ANY
              INFORMATION PROVIDED ON THIS WEBSITE. BECAUSE SOME STATES OR
              JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF
              LIABILITY FOR CONSEQUENTIAL OR INCIDENTAL DAMAGES, THE ABOVE
              LIMITATION MAY NOT APPLY TO YOU.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              You acknowledge and agree that We may unilaterally change these
              Terms and Conditions. We recommend reviewing these Terms and
              Conditions from time to time as any such changes will be reflected
              in this section of Our Website.
            </p>

            <div className="bg-blue-50 rounded-lg p-6 mt-8">
              <p className="text-blue-800 font-semibold mb-2">Last Updated:</p>
              <p className="text-blue-700">January 1, 2025</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white shadow-2xl">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Questions About Our Terms and Conditions?
              </h2>
              <p className="text-xl mb-8 opacity-90 leading-relaxed">
                We're here to help you understand our terms and conditions.
                Contact us if you have any questions about your rights and
                responsibilities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Contact Us
                </Link>
                <Link
                  href="/privacy-policy"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  View Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Need Clarification?
            </h2>
            <p className="text-xl text-gray-600">
              Our team is here to help you understand our terms and conditions
              and answer any questions you may have.
            </p>
          </div>
          <ContactForm title="Get in Touch" />
        </div>
      </section>
    </Layout>
  );
}
