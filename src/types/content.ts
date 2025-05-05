export interface Certificate {
  title: string;
  image: string;
}

export interface AboutContent {
  title: string;
  subtitle: string;
  description: string;
  photo: string;
  heroBg: string;
  experience: string;
  advantages: string[];
  certificates: Certificate[];
}

export interface Service {
  title: string;
  description: string;
  image: string;
  price: string;
}

export interface ProductsContent {
  title: string;
  description: string;
  services: Service[];
  heroBg?: string;
} 