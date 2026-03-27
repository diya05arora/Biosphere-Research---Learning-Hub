import Layout from "../components/Layout";

const domainSections = [
  {
    title: "Biopharmaceutical Research",
    img: "/assets/img/domains11.png",
    points: [
      "Drug Discovery & Development",
      "Molecular Biology & Genetic Engineering",
      "Bioprocess Engineering",
      "Diagnostics & Rapid Testing",
      "Regulatory & Quality Compliance"
    ]
  },
  {
    title: "Information Technology in Biotech & Healthcare",
    img: "/assets/img/domains12.png",
    points: [
      "Bioinformatics & Computational Biology",
      "Healthcare Digital Solutions",
      "Blockchain & IoT in Biopharma"
    ]
  },
  {
    title: "Learning Hub - Bridging Academia & Industry",
    img: "/assets/img/domains13.png",
    points: [
      "Skill Development & Training",
      "Research & Innovation Programs",
      "Career Mentorship"
    ]
  }
];

export default function DomainsPage() {
  return (
    <Layout active="domains">
      <section id="domains" className="domain section">
        {domainSections.map((section) => (
          <div className="container mb-4" key={section.title}>
            <div className="row gy-4">
              <div className="col-lg-5">
                <img src={section.img} className="img-fluid" alt="" />
              </div>
              <div className="col-lg-7">
                <div className="content">
                  <h3>{section.title}</h3>
                  <ul>
                    {section.points.map((point) => (
                      <li key={point}>
                        <i className="bi bi-check-circle-fill"></i>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>
    </Layout>
  );
}
