
import { GoogleGenerativeAI } from '@google/generative-ai';
import Logger from '../../infra/logger/winston';
import { GenerateDescriptionDTO } from './jobs.types';

export class JobsAIService {
    private genAI: GoogleGenerativeAI | null = null;
    private groqKey: string | null = null;

    constructor(private readonly logger: Logger) {
        const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;
        this.groqKey = process.env.GROQ_API_KEY || null;

        if (geminiApiKey) {
            this.genAI = new GoogleGenerativeAI(geminiApiKey);
        } else {
            this.logger.instance.warn("[JobsAIService] No GOOGLE_API_KEY found.");
        }

        if (!this.groqKey) {
            this.logger.instance.warn("[JobsAIService] No GROQ_API_KEY found. Llama fallback disabled.");
        }
    }

    private async generateWithLlama(prompt: string): Promise<any> {
        if (!this.groqKey) throw new Error("Groq API Key missing");

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.groqKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "Tu es un expert en recrutement. Réponds exclusivement en JSON sans texte introductif."
                    },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const err = await response.json() as any;
            throw new Error(`Groq API Error: ${err.error?.message || response.statusText}`);
        }

        const data = await response.json() as any;
        const content = data.choices[0].message.content;
        return JSON.parse(content);
    }

    async generateDescription(dto: GenerateDescriptionDTO): Promise<{
        full_content: string;
        suggested_salary_range?: { min: number; max: number; currency: string }
    }> {
        if (!this.genAI && !this.groqKey) {
            this.logger.instance.info("[JobsAIService] Returning mock description (No API Keys).");
            return this.getMockFallback(dto);
        }

        const prompt = `
            Agis comme un expert RH et recruteur senior.
            Rédige une offre d'emploi COMPLÈTE, attractive et très professionnelle pour le poste suivant.
            
            Détails du poste :
            - Titre : ${dto.job_title}
            - Secteur : ${dto.industry || 'Non spécifié'}
            - Ton souhaité : ${dto.tone || 'Professionnel, institutionnel et engageant'}
            - Mots-clés : ${dto.keywords?.join(', ')}

            La description DOIT suivre ce format EXACT (en français) :

            Description de l'entreprise
            [Une brève présentation de l'entreprise et du contexte]

            Description du poste
            [Missions principales et responsabilités détaillées]

            Qualifications
            [Utiliser impérativement des tirets ou des points pour cette section]
            - [Compétence 1]
            - [Compétence 2]
            ...

            Localisations
            [Informations sur le lieu de travail et les modalités, ex: Porto-Novo, Télétravail, etc.]

            Format de réponse STRICT (JSON uniquement) :
            {
                "full_content": "Le texte complet formaté comme demandé ci-dessus.",
                "suggested_salary_range": { "min": 35000, "max": 45000, "currency": "EUR" }
            }
        `;

        try {
            // Priority 1: Gemini Models
            if (this.genAI) {
                const modelsToTry = ["gemini-2.0-flash-lite", "gemini-2.0-flash"];
                for (const modelName of modelsToTry) {
                    try {
                        this.logger.instance.info(`[JobsAIService] Attempting with Gemini: ${modelName}`);
                        const model = this.genAI.getGenerativeModel({ model: modelName });
                        const result = await model.generateContent(prompt);
                        const response = await result.response;
                        let text = response.text();

                        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
                        const jsonStart = text.indexOf('{');
                        const jsonEnd = text.lastIndexOf('}');
                        if (jsonStart !== -1 && jsonEnd !== -1) {
                            text = text.substring(jsonStart, jsonEnd + 1);
                        }
                        return JSON.parse(text);
                    } catch (err: any) {
                        this.logger.instance.warn(`[JobsAIService] Gemini ${modelName} failed: ${err.message}`);
                    }
                }
            }

            // Priority 2: Llama 3 via Groq
            if (this.groqKey) {
                try {
                    this.logger.instance.info(`[JobsAIService] Attempting with Llama 3 via Groq`);
                    return await this.generateWithLlama(prompt);
                } catch (err: any) {
                    this.logger.instance.error(`[JobsAIService] Llama/Groq failed: ${err.message}`);
                }
            }

            throw new Error("All AI providers failed");

        } catch (error: any) {
            this.logger.instance.error(`[JobsAIService] Critical AI Failure: ${error.message}`);
            return this.getMockFallback(dto);
        }
    }

    private getMockFallback(dto: GenerateDescriptionDTO) {
        return {
            full_content: `Description de l'entreprise\nNous sommes une entreprise leader dans notre secteur, reconnue pour notre innovation et notre engagement envers l'excellence. Nous recherchons une personne passionnée pour rejoindre notre équipe dynamique.\n\nDescription du poste\nEn tant que ${dto.job_title}, vous serez responsable de la conception et de la mise en œuvre de solutions stratégiques. Vous travaillerez en étroite collaboration avec les équipes techniques et produit pour garantir la qualité et la performance.\n\nQualifications\n- Expérience d'au moins 3 ans en tant que ${dto.job_title}\n- Excellente capacité d'analyse et de résolution de problèmes\n- Maîtrise des outils standards du marché\n- Esprit d'équipe et autonomie\n\nLocalisations\nPorto-Novo, Télétravail possible.`,
            suggested_salary_range: { min: 45000, max: 65000, currency: 'EUR' }
        };
    }
}
