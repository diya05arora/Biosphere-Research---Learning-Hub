import Layout from "../components/Layout";

export default function AboutPage() {
  return (
    <Layout active="about">
      <section id="about" className="about section">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-5">
              <img src="/assets/img/about.jpg" className="img-fluid" alt="" />
            </div>
            <div className="col-lg-7">
              <div className="content">
                <h3>About BioSphere</h3>
                <p>
                  BioSphere is a pioneering research and education hub dedicated to transforming healthcare through cutting-edge
                  research, advanced technology, and innovative learning.
                </p>
                <ul>
                  <li><i className="bi bi-check-circle-fill"></i><span><b>Mission: </b>Bridge biotechnology and digital innovation.</span></li>
                  <li><i className="bi bi-check-circle-fill"></i><span><b>Vision: </b>Lead innovation in diagnostics and healthcare.</span></li>
                  <li><i className="bi bi-check-circle-fill"></i><span><b>Innovative Solutions: </b>AI diagnostics and precision medicine.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about section">
        <div className="container">
          <div className="content">
            <h3 id="msg">Founder's Message</h3>
            <figure>
              <img src="/assets/img/founder.png" className="img-founder" alt="Prem Anurag" />
              <figcaption>Prem Anurag<br />Founder & CEO, BioSphere Research and Learning Hub</figcaption>
            </figure>
            <p>
              We envisioned BioSphere as more than just a startup - it is a movement to transform diagnostics, research,
              and innovation.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
