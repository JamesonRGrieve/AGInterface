'use client';
export function Features() {
  return (
    <section id='features' className='py-20 bg-background'>
      <div className='container px-6 mx-auto'>
        <h2 className='mb-12 text-3xl font-bold text-center'>Advanced Analytics at Your Fingertips</h2>
        <div className='grid grid-cols-1 gap-12 md:grid-cols-3'>
          {features.map((feature, index) => (
            <div key={index} className='p-6 rounded-lg shadow-md bg-secondary-50'>
              <h3 className='mb-4 text-xl font-semibold text-primary-700'>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    title: 'Natural Language Queries',
    description: 'Ask complex questions in plain English and receive detailed analyses and visualizations.',
  },
  {
    title: 'Multi-Database Integration',
    description: 'Seamlessly connect to SQLite, MySQL, or PostgreSQL databases. Cross-database analysis coming soon!',
  },
  {
    title: 'Predictive Analytics',
    description: 'Leverage machine learning models to forecast trends and make data-driven decisions.',
  },
  {
    title: 'Automated Reporting',
    description: 'Schedule and generate comprehensive reports with key insights and visualizations.',
  },
  {
    title: 'Anomaly Detection',
    description: 'Automatically identify outliers and unusual patterns in your data.',
  },
  {
    title: 'Collaborative Insights',
    description: 'Share and discuss findings with team members in real-time.',
  },
];
