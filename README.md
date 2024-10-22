# Proyecto de Generación de Entornos de 360 Grados para VR Usando IA Basada en Cuentos

Este proyecto tiene como objetivo crear entornos virtuales de 360 grados a partir de cuentos, utilizando inteligencia artificial para generar tanto las imágenes como los sonidos que componen estos entornos. El proyecto utiliza una combinación de modelos avanzados de lenguaje, modelos de difusión para imágenes, y una base de datos vectorial de sonidos para proporcionar una experiencia inmersiva completa.

## Estructura del Proyecto

El proyecto se divide en las siguientes fases principales:

1. **Análisis del Texto**: 
   - Utilización de modelos de lenguaje (LLMs) para detectar capítulos y crear descripciones detalladas.
   
2. **Generación de Imágenes**:
   - Empleo de modelos de difusión para crear entornos visuales basados en las descripciones generadas.
   
3. **Generación de Sonidos**:
   - Uso de una base vectorial de sonidos para encontrar y ubicar efectos sonoros en el espacio 360.

## Modelos Utilizados

### Large Language Models (LLMs)

Para la detección de capítulos y creación de descripciones se utilizarán los siguientes modelos:

- **OpenAI GPT-4**: Reconocido por su calidad superior en generación de texto, con un context window de 120k tokens.

### Modelos de Difusión para Imágenes

Para la generación de entornos visuales se utilizarán modelos de difusión ajustados para la creación de imágenes 360 grados:

- **Stable Diffusion XL**: Utilizado para generar imágenes de alta calidad (768 px) y con capacidad de integración de LoRAs para personalización.
- **LoRA 360Redmond**: Ajustado específicamente para generación de imágenes en 360 grados. Disponible en [Hugging Face](https://huggingface.co/artificialguybr/360Redmond).

Herramientas adicionales para mejorar la calidad de las imágenes:

- **Clarity Upscaler**: Mejora los detalles y la resolución de las imágenes. [Disponible aquí](https://replicate.com/philz1337x/clarity-upscaler).

### Generación de Sonidos

Para la generación de sonidos se ha optado por la creación de una base vectorial de sonidos. Esta base permite realizar búsquedas semánticas para encontrar y ubicar sonidos adecuados en el espacio 360, proporcionando una experiencia sonora envolvente.

## Pruebas de los Modelos

- **Stable Diffusion XL**: Pruebas disponibles en [Hugging Face](https://huggingface.co/spaces/KingNish/SDXL-Flash).
- **Modelo 360 de Stable Diffusion**: Pruebas disponibles en [Replicate](https://replicate.com/lucataco/sdxl-panoramic).
- **Clarity Upscaler**: Pruebas disponibles en [Replicate](https://replicate.com/philz1337x/clarity-upscaler).

## Desarrollo y Uso

Este proyecto está desarrollado con el objetivo de facilitar la creación de experiencias VR inmersivas a partir de cuentos. 
