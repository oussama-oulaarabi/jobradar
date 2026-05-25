/**
 * Realistic Mock Job Scraper to guarantee instant functionality 
 * with beautiful, curated data matching all user criteria.
 */
export async function scrapeMockJobs(keywords, countries, categories) {
  console.log('🤖 Running Mock Scraper to pre-populate and test...');

  const mockTemplates = [
    // DevOps
    {
      titles: ['Ingénieur DevOps Cloud', 'Consultant DevOps senior', 'Architecte Kubernetes / DevOps', 'DevOps Specialist (CI/CD)'],
      companies: ['Capgemini', 'Orange Business Services', 'Atos', 'Société Générale', 'Inwi', 'CGI', 'Ubisoft'],
      locations: {
        ma: ['Casablanca (Nearshore)', 'Rabat (Technopolis)', 'Marrakech'],
        fr: ['Paris (La Défense)', 'Lyon', 'Nantes', 'Toulouse'],
        ca: ['Montréal (QC)', 'Toronto (ON)', 'Vancouver (BC)']
      },
      category: 'devops',
      descriptions: [
        'Nous recherchons un ingénieur DevOps passionné par l\'automatisation pour rejoindre nos équipes. Vous concevrez et maintiendrez des pipelines CI/CD robustes avec Jenkins et GitLab CI, administrerez nos clusters Kubernetes de production et veillerez à l\'automatisation de l\'infrastructure avec Terraform.',
        'Intégrez notre pôle d\'excellence infrastructure en tant que DevOps. Mission : concevoir les architectures d\'intégration et déploiement continu, manager les infrastructures conteneurisées Docker/Kubernetes et assurer le support aux développeurs.'
      ]
    },
    // Cloud
    {
      titles: ['Architecte Cloud AWS', 'Ingénieur Cloud Azure Specialist', 'Cloud Security Engineer (AWS/Azure)', 'Consultant Cloud public AWS'],
      companies: ['Sopra Steria', 'Devoteam', 'Accenture', 'Deloitte', 'OCP Group', 'Bell Canada', 'Desjardins'],
      locations: {
        ma: ['Rabat', 'Casablanca', 'Benguerir (Green City)'],
        fr: ['Paris Centre', 'Bordeaux', 'Lille'],
        ca: ['Montréal', 'Ottawa (ON)', 'Québec (QC)']
      },
      category: 'cloud',
      descriptions: [
        'Au sein de notre centre d\'excellence Cloud, vous accompagnerez la migration d\'applications critiques vers AWS et Azure. Maîtrise avancée des services IaaS/PaaS (EC2, S3, AKS, EKS), de la sécurité Cloud et de l\'IaC indispensable.',
        'Nous recrutons un ingénieur spécialisé dans l\'écosystème Azure et AWS. Vous participerez à la conception d\'architectures multicloud scalables, hautement disponibles et hautement sécurisées pour nos clients d\'envergure internationale.'
      ]
    },
    // Observability
    {
      titles: ['Ingénieur Observabilité & SRE', 'Expert Monitoring ELK & Grafana', 'Ingénieur Monitoring / APM', 'Administrateur Elasticsearch / Kibana'],
      companies: ['Thales', 'Vidal Associates', 'SQLI', 'Wipro', 'Moroccan IT Solutions', 'National Bank of Canada'],
      locations: {
        ma: ['Casablanca', 'Salé'],
        fr: ['Sophia Antipolis', 'Paris', 'Grenoble'],
        ca: ['Montréal', 'Sherbrooke (QC)']
      },
      category: 'observability',
      descriptions: [
        'Rejoignez notre équipe d\'observabilité en charge du maintien opérationnel. Vous déploierez et optimiserez la stack de monitoring ELK (Elasticsearch, Logstash, Kibana) et Grafana / Prometheus pour superviser nos microservices en temps réel.',
        'Spécialiste de la surveillance d\'infrastructure complexe ? Venez configurer nos tableaux de bord Grafana et nos pipelines de centralisation des logs sous Elasticsearch pour améliorer nos temps de résolution d\'incidents (SRE).'
      ]
    },
    // Big Data
    {
      titles: ['Data Engineer (Spark/Kafka)', 'Consultant Big Data Databricks', 'Architecte Big Data & Analytics', 'Lead Data Engineer Scala / Spark'],
      companies: ['BCG Gamma', 'Dataiku', 'Palantir', 'Intelcia', 'CDG Capital', 'Alithya', 'Coveo'],
      locations: {
        ma: ['Casablanca', 'Fès', 'Rabat'],
        fr: ['Paris (Champs-Élysées)', 'Rennes', 'Marseille'],
        ca: ['Montréal', 'Toronto', 'Calgary (AB)']
      },
      category: 'bigdata',
      descriptions: [
        'En tant que Data Engineer, vous concevrez des pipelines d\'alimentation en temps réel et en batch. Maîtrise experte d\'Apache Spark, Apache Kafka, Hadoop et de plateformes Cloud comme Databricks requise.',
        'Rejoignez notre pôle Data pour relever des défis d\'envergure : traitement de téraoctets de données quotidiennes, gestion de clusters Hadoop/Spark, et développement de flux de streaming Kafka haut débit.'
      ]
    },
    // Java
    {
      titles: ['Développeur Java Spring Boot Senior', 'Ingénieur d\'Études Java / Spring', 'Architecte Logiciel Java / Microservices', 'Lead Tech Java / Spring Cloud'],
      companies: ['Adria Business & Technology', 'HPS', 'Bull Maroc', 'Capgemini France', 'BNP Paribas', 'CGI Canada'],
      locations: {
        ma: ['Casablanca (Sidi Maarouf)', 'Rabat', 'Tanger'],
        fr: ['Paris', 'Lyon', 'Strasbourg'],
        ca: ['Montréal', 'Québec']
      },
      category: 'java-spring',
      descriptions: [
        'Nous cherchons un expert Java pour concevoir et faire évoluer nos microservices financiers critiques. Frameworks requis : Spring Boot, Spring Security, Spring Cloud, Hibernate. Une sensibilité au DevOps est un vrai plus !',
        'Intégrez une équipe agile travaillant sur des projets d\'envergure en Java 17/21 et Spring Boot. Vous interviendrez sur l\'ensemble du cycle de vie du produit, de la conception technique aux tests automatisés.'
      ]
    },
    // Frontend
    {
      titles: ['Développeur Frontend React.js', 'Ingénieur UI/UX Frontend React / Vite', 'Lead Web Developer React / TS', 'Développeur React / Next.js'],
      companies: ['Vercel France', 'Mirakl', 'PayFit', 'Chantiers de l\'Atlantique', 'L\'Oréal', 'Shopify Canada'],
      locations: {
        ma: ['Casablanca', 'Marrakech', 'Rabat'],
        fr: ['Paris', 'Nantes', 'Montpellier'],
        ca: ['Montréal', 'Toronto', 'Remote Canada']
      },
      category: 'frontend',
      descriptions: [
        'Passionné de belles interfaces fluides ? Notre équipe produit recrute un Développeur React.js sénior. Vous travaillerez avec React 18, TypeScript, TailwindCSS et Vite pour offrir une expérience utilisateur exceptionnelle.',
        'Nous recrutons un développeur d\'applications Web Frontend. Votre rôle sera de développer des composants UI réutilisables, optimiser la vitesse de chargement de l\'application et collaborer avec les designers Figma.'
      ]
    }
  ];

  const jobs = [];
  const sources = ['jooble', 'adzuna', 'linkedin', 'indeed', 'rekrute'];

  // Select countries that are active
  const activeCountries = countries.filter(c => c.enabled).map(c => c.code);
  if (activeCountries.length === 0) activeCountries.push('ma');

  // Let's generate a rich list of 15 to 20 realistic jobs
  const jobCount = 15 + Math.floor(Math.random() * 8);

  for (let i = 0; i < jobCount; i++) {
    // Select random category
    const categoryTemplate = mockTemplates[Math.floor(Math.random() * mockTemplates.length)];
    const country = activeCountries[Math.floor(Math.random() * activeCountries.length)];
    
    const title = categoryTemplate.titles[Math.floor(Math.random() * categoryTemplate.titles.length)];
    const company = categoryTemplate.companies[Math.floor(Math.random() * categoryTemplate.companies.length)];
    const locArray = categoryTemplate.locations[country] || ['Paris'];
    const location = locArray[Math.floor(Math.random() * locArray.length)];
    const description = categoryTemplate.descriptions[Math.floor(Math.random() * categoryTemplate.descriptions.length)];
    
    // Select source
    let source = sources[Math.floor(Math.random() * sources.length)];
    // rekrute is only for Morocco
    if (source === 'rekrute' && country !== 'ma') {
      source = 'linkedin';
    }

    // Generate date (1 to 5 days ago)
    const daysAgo = Math.floor(Math.random() * 5) + 1;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const postedDate = date.toISOString().split('T')[0];

    // Dummy application URL
    const url = source === 'linkedin' 
      ? `https://www.linkedin.com/jobs/view/mock-job-${i + 1000}`
      : source === 'indeed'
      ? `https://www.indeed.com/viewjob?jk=mock-jk-${i + 2000}`
      : source === 'rekrute'
      ? `https://www.rekrute.com/offre-emploi-mock-${i + 3000}.html`
      : `https://example.com/jobs/apply-${i + 4000}`;

    jobs.push({
      title,
      company,
      location,
      country,
      source,
      url,
      description,
      category: categoryTemplate.category,
      postedDate
    });
  }

  // Filter jobs by matching keywords if provided (to make it look accurate)
  const filteredJobs = jobs.filter(job => {
    if (keywords.length === 0) return true;
    const searchSpace = `${job.title} ${job.description}`.toLowerCase();
    return keywords.some(kw => searchSpace.includes(kw.toLowerCase()));
  });

  return filteredJobs.length > 0 ? filteredJobs : jobs;
}
