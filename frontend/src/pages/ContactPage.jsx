import Layout from "../components/Layout";

export default function ContactPage() {
  return (
    <Layout active="contact">
      <section id="contact" className="contact section">
        <div className="container section-title">
          <h2>Contact</h2>
        </div>

        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-4">
              <div className="info-item d-flex flex-column justify-content-center align-items-center">
                <i className="bi bi-geo-alt"></i>
                <h3>Address</h3>
                <p>Shahwajpur, Muzaffarpur, Bihar, India-842004</p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="info-item d-flex flex-column justify-content-center align-items-center">
                <i className="bi bi-telephone"></i>
                <h3>Call Us</h3>
                <p>+91-7519990367</p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="info-item d-flex flex-column justify-content-center align-items-center">
                <i className="bi bi-envelope"></i>
                <h3>Email Us</h3>
                <p>anurag.mdiagnostic@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
