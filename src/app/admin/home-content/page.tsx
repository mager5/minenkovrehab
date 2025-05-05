'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageUpload from '@/components/ImageUpload';

interface HomeContent {
  hero: {
    title: string;
    description: string;
    bg: string;
  };
  about: {
    title: string;
    description: string;
    experience: string;
    priceTitle: string;
    priceDescription: string;
    methodsTitle: string;
    methodsDescription: string;
    bg: string;
  };
  advantages: Array<{
    title: string;
    description: string;
  }>;
  stats: {
    satisfiedClients: number;
    satisfiedClientsLabel: string;
    consultations: number;
    consultationsLabel: string;
    onlinePrograms: number;
    onlineProgramsLabel: string;
    experience: number;
    experienceLabel: string;
  };
  services: {
    title: string;
    consultations: {
      title: string;
      description: string;
    };
    programs: {
      title: string;
      description: string;
    };
    analysis: {
      title: string;
      description: string;
    };
  };
  help: {
    title: string;
    subtitle: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  cta: {
    title: string;
    description: string;
    buttonText: string;
  };
}

export default function HomeContent() {
  const [content, setContent] = useState<HomeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/content-home')
      .then(res => res.json())
      .then(data => {
        setContent(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading content:', error);
        setError('Failed to load content');
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    if (!content) return;
    
    try {
      const res = await fetch('/api/content-home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      if (!res.ok) throw new Error('Failed to save content');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: unknown) {
      console.error('Error saving content:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading || !content) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Home Content</h1>

      <div className="space-y-8">
        {/* Hero Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Hero Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={content.hero.title}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  hero: { ...prev.hero, title: e.target.value }
                } : null)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={content.hero.description}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  hero: { ...prev.hero, description: e.target.value }
                } : null)}
                rows={3}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Background Image</label>
              <div className="flex items-center gap-4">
                {content.hero.bg && (
                  <div className="relative w-32 h-32">
                    <Image
                      src={content.hero.bg}
                      alt="Hero background"
                      fill
                      className="object-cover rounded"
                    />
                    <button
                      onClick={() => setContent(prev => prev ? {
                        ...prev,
                        hero: { ...prev.hero, bg: '' }
                      } : null)}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                    >
                      ×
                    </button>
                  </div>
                )}
                <ImageUpload
                  onUpload={url => setContent(prev => prev ? {
                    ...prev,
                    hero: { ...prev.hero, bg: url }
                  } : null)}
                  currentImage={content.hero.bg}
                />
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">About Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={content.about.title}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  about: { ...prev.about, title: e.target.value }
                } : null)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={content.about.description}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  about: { ...prev.about, description: e.target.value }
                } : null)}
                rows={3}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Experience</label>
              <input
                type="text"
                value={content.about.experience}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  about: { ...prev.about, experience: e.target.value }
                } : null)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price Title</label>
              <input
                type="text"
                value={content.about.priceTitle}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  about: { ...prev.about, priceTitle: e.target.value }
                } : null)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price Description</label>
              <textarea
                value={content.about.priceDescription}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  about: { ...prev.about, priceDescription: e.target.value }
                } : null)}
                rows={2}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Methods Title</label>
              <input
                type="text"
                value={content.about.methodsTitle}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  about: { ...prev.about, methodsTitle: e.target.value }
                } : null)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Methods Description</label>
              <textarea
                value={content.about.methodsDescription}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  about: { ...prev.about, methodsDescription: e.target.value }
                } : null)}
                rows={2}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Background Image</label>
              <div className="flex items-center gap-4">
                {content.about.bg && (
                  <div className="relative w-32 h-32">
                    <Image
                      src={content.about.bg}
                      alt="About background"
                      fill
                      className="object-cover rounded"
                    />
                    <button
                      onClick={() => setContent(prev => prev ? {
                        ...prev,
                        about: { ...prev.about, bg: '' }
                      } : null)}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                    >
                      ×
                    </button>
                  </div>
                )}
                <ImageUpload
                  onUpload={url => setContent(prev => prev ? {
                    ...prev,
                    about: { ...prev.about, bg: url }
                  } : null)}
                  currentImage={content.about.bg}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Advantages Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Advantages</h2>
          <div className="space-y-4">
            {content.advantages.map((advantage, index) => (
              <div key={index} className="space-y-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Title {index + 1}</label>
                  <input
                    type="text"
                    value={advantage.title}
                    onChange={e => {
                      const newAdvantages = [...content.advantages];
                      newAdvantages[index] = { ...advantage, title: e.target.value };
                      setContent(prev => prev ? { ...prev, advantages: newAdvantages } : null);
                    }}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description {index + 1}</label>
                  <textarea
                    value={advantage.description}
                    onChange={e => {
                      const newAdvantages = [...content.advantages];
                      newAdvantages[index] = { ...advantage, description: e.target.value };
                      setContent(prev => prev ? { ...prev, advantages: newAdvantages } : null);
                    }}
                    rows={2}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Satisfied Clients</label>
              <input
                type="number"
                value={content.stats.satisfiedClients}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  stats: { ...prev.stats, satisfiedClients: parseInt(e.target.value) }
                } : null)}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                value={content.stats.satisfiedClientsLabel}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  stats: { ...prev.stats, satisfiedClientsLabel: e.target.value }
                } : null)}
                className="w-full p-2 border rounded mt-2"
                placeholder="Label"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Consultations</label>
              <input
                type="number"
                value={content.stats.consultations}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  stats: { ...prev.stats, consultations: parseInt(e.target.value) }
                } : null)}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                value={content.stats.consultationsLabel}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  stats: { ...prev.stats, consultationsLabel: e.target.value }
                } : null)}
                className="w-full p-2 border rounded mt-2"
                placeholder="Label"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Online Programs</label>
              <input
                type="number"
                value={content.stats.onlinePrograms}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  stats: { ...prev.stats, onlinePrograms: parseInt(e.target.value) }
                } : null)}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                value={content.stats.onlineProgramsLabel}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  stats: { ...prev.stats, onlineProgramsLabel: e.target.value }
                } : null)}
                className="w-full p-2 border rounded mt-2"
                placeholder="Label"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Experience</label>
              <input
                type="number"
                value={content.stats.experience}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  stats: { ...prev.stats, experience: parseInt(e.target.value) }
                } : null)}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                value={content.stats.experienceLabel}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  stats: { ...prev.stats, experienceLabel: e.target.value }
                } : null)}
                className="w-full p-2 border rounded mt-2"
                placeholder="Label"
              />
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Services</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Section Title</label>
              <input
                type="text"
                value={content.services.title}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  services: { ...prev.services, title: e.target.value }
                } : null)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Consultations</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={content.services.consultations.title}
                    onChange={e => setContent(prev => prev ? {
                      ...prev,
                      services: {
                        ...prev.services,
                        consultations: { ...prev.services.consultations, title: e.target.value }
                      }
                    } : null)}
                    className="w-full p-2 border rounded"
                    placeholder="Title"
                  />
                  <textarea
                    value={content.services.consultations.description}
                    onChange={e => setContent(prev => prev ? {
                      ...prev,
                      services: {
                        ...prev.services,
                        consultations: { ...prev.services.consultations, description: e.target.value }
                      }
                    } : null)}
                    rows={2}
                    className="w-full p-2 border rounded"
                    placeholder="Description"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Programs</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={content.services.programs.title}
                    onChange={e => setContent(prev => prev ? {
                      ...prev,
                      services: {
                        ...prev.services,
                        programs: { ...prev.services.programs, title: e.target.value }
                      }
                    } : null)}
                    className="w-full p-2 border rounded"
                    placeholder="Title"
                  />
                  <textarea
                    value={content.services.programs.description}
                    onChange={e => setContent(prev => prev ? {
                      ...prev,
                      services: {
                        ...prev.services,
                        programs: { ...prev.services.programs, description: e.target.value }
                      }
                    } : null)}
                    rows={2}
                    className="w-full p-2 border rounded"
                    placeholder="Description"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Analysis</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={content.services.analysis.title}
                    onChange={e => setContent(prev => prev ? {
                      ...prev,
                      services: {
                        ...prev.services,
                        analysis: { ...prev.services.analysis, title: e.target.value }
                      }
                    } : null)}
                    className="w-full p-2 border rounded"
                    placeholder="Title"
                  />
                  <textarea
                    value={content.services.analysis.description}
                    onChange={e => setContent(prev => prev ? {
                      ...prev,
                      services: {
                        ...prev.services,
                        analysis: { ...prev.services.analysis, description: e.target.value }
                      }
                    } : null)}
                    rows={2}
                    className="w-full p-2 border rounded"
                    placeholder="Description"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Help Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Help Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={content.help.title}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  help: { ...prev.help, title: e.target.value }
                } : null)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtitle</label>
              <input
                type="text"
                value={content.help.subtitle}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  help: { ...prev.help, subtitle: e.target.value }
                } : null)}
                className="w-full p-2 border rounded"
              />
            </div>

            <div className="space-y-4">
              {content.help.items.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Item {index + 1} Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={e => {
                        const newItems = [...content.help.items];
                        newItems[index] = { ...item, title: e.target.value };
                        setContent(prev => prev ? {
                          ...prev,
                          help: { ...prev.help, items: newItems }
                        } : null);
                      }}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Item {index + 1} Description</label>
                    <textarea
                      value={item.description}
                      onChange={e => {
                        const newItems = [...content.help.items];
                        newItems[index] = { ...item, description: e.target.value };
                        setContent(prev => prev ? {
                          ...prev,
                          help: { ...prev.help, items: newItems }
                        } : null);
                      }}
                      rows={2}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Call to Action</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={content.cta.title}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  cta: { ...prev.cta, title: e.target.value }
                } : null)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={content.cta.description}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  cta: { ...prev.cta, description: e.target.value }
                } : null)}
                rows={3}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Button Text</label>
              <input
                type="text"
                value={content.cta.buttonText}
                onChange={e => setContent(prev => prev ? {
                  ...prev,
                  cta: { ...prev.cta, buttonText: e.target.value }
                } : null)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          >
            Save Changes
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 text-green-700 rounded">
            Changes saved successfully!
          </div>
        )}
      </div>
    </div>
  );
} 