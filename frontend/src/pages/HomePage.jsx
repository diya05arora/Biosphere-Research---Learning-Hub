import Layout from "../components/Layout";

export default function HomePage() {
  return (
    <Layout active="home">
      <section id="hero" className="hero section dark-background">
        <img src="/assets/img/hero-bg.jpg" alt="" />
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-xl-6 col-lg-8">
              <h2>BioSphere Research and Learning Hub</h2>
              <p>Innovate. Integrate. Inspire.</p>
            </div>
          </div>

          <div className="row gy-4 mt-5 justify-content-center">
            {[
              ["bi-binoculars", "Biotechnology"],
              ["bi-bullseye", "Digital Innovation"],
              ["bi-fullscreen-exit", "Developed India"],
              ["bi-card-list", "Learning Initiatives"],
              ["bi-gem", "Next-Gen Research"]
            ].map(([icon, title]) => (
              <div className="col-xl-2 col-md-4" key={title}>
                <div className="icon-box">
                  <i className={`bi ${icon}`}></i>
                  <h3><a href="#">{title}</a></h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                  <li><i className="bi bi-check-circle-fill"></i><span><b>Vision: </b>Lead breakthrough innovation in diagnostics and healthcare.</span></li>
                  <li><i className="bi bi-check-circle-fill"></i><span><b>Innovative Solutions: </b>AI diagnostics, precision medicine, and next-gen learning.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="stats" className="stats section dark-background">
        <img src="/assets/img/stats-bg.jpg" alt="" />
        <div className="container position-relative">
          <div className="row gy-4">
            {[
              [10, "Professors"],
              [50, "Projects"],
              [453, "Hours Of Training"],
              [32, "Students"]
            ].map(([value, label]) => (
              <div className="col-lg-3 col-md-6" key={label}>
                <div className="stats-item text-center w-100 h-100">
                  <span>{value}</span>
                  <p>{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
