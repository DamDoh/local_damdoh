/**
 * Communication Templates Service - Advanced business communication templates
 * Provides structured templates for negotiations, contracts, inspections, and follow-ups
 * Single Responsibility: Template management and business communication automation
 * Dependencies: Messaging system, user profiles, business data
 */

import { apiCall } from '@/lib/api-utils';

export interface CommunicationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'negotiation' | 'contract' | 'inspection' | 'followup' | 'complaint' | 'partnership';
  type: 'message' | 'email' | 'proposal' | 'contract' | 'report';
  stakeholderType: 'farmer' | 'buyer' | 'supplier' | 'investor' | 'inspector' | 'all';
  language: string;
  subject?: string;
  content: string;
  variables: TemplateVariable[];
  attachments?: TemplateAttachment[];
  isActive: boolean;
  usageCount: number;
  successRate?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  required: boolean;
  defaultValue?: string;
  options?: string[]; // for select type
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface TemplateAttachment {
  name: string;
  type: 'document' | 'image' | 'spreadsheet' | 'pdf';
  required: boolean;
  template?: string; // URL or template reference
}

export interface CommunicationInstance {
  id: string;
  templateId: string;
  senderId: string;
  recipientId: string;
  variables: Record<string, any>;
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'responded' | 'completed';
  sentAt?: Date;
  respondedAt?: Date;
  response?: string;
  attachments?: string[];
  followUpScheduled?: Date;
  metadata: Record<string, any>;
}

export interface NegotiationFlow {
  id: string;
  name: string;
  description: string;
  steps: NegotiationStep[];
  applicableTo: string[]; // product types or deal types
  estimatedDuration: number; // in days
  successRate?: number;
}

export interface NegotiationStep {
  id: string;
  name: string;
  description: string;
  order: number;
  templateId: string;
  triggerCondition?: string; // when to send this step
  delayDays: number; // delay after previous step
  requiredResponse: boolean;
  fallbackTemplateId?: string; // if no response
  escalationTemplateId?: string; // if negative response
}

export interface ContractTemplate {
  id: string;
  name: string;
  type: 'supply' | 'service' | 'partnership' | 'investment' | 'insurance';
  jurisdiction: string;
  language: string;
  sections: ContractSection[];
  variables: TemplateVariable[];
  legalReviewRequired: boolean;
  autoRenewal: boolean;
  terminationClauses: string[];
}

export interface ContractSection {
  id: string;
  title: string;
  content: string;
  required: boolean;
  order: number;
  variables: string[]; // variable keys used in this section
}

export interface QualityInspectionWorkflow {
  id: string;
  name: string;
  productType: string;
  checkpoints: InspectionCheckpoint[];
  automatedScoring: boolean;
  requiredApprovals: number;
  escalationThreshold: number; // score below which to escalate
}

export interface InspectionCheckpoint {
  id: string;
  name: string;
  description: string;
  type: 'visual' | 'measurement' | 'test' | 'documentation';
  criteria: string;
  acceptableValues?: string[];
  weight: number; // importance in overall score
  photosRequired: boolean;
  notesRequired: boolean;
}

export class CommunicationTemplatesService {
  private static instance: CommunicationTemplatesService;
  private readonly CACHE_KEY = 'communication-templates';
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  static getInstance(): CommunicationTemplatesService {
    if (!CommunicationTemplatesService.instance) {
      CommunicationTemplatesService.instance = new CommunicationTemplatesService();
    }
    return CommunicationTemplatesService.instance;
  }

  /**
   * Get available templates for a user and context
   */
  async getTemplates(
    userId: string,
    category?: string,
    stakeholderType?: string,
    language: string = 'en'
  ): Promise<CommunicationTemplate[]> {
    try {
      const params = new URLSearchParams({
        userId,
        language,
        ...(category && { category }),
        ...(stakeholderType && { stakeholderType })
      });

      const result = await apiCall(`/api/communication/templates?${params}`) as { templates: CommunicationTemplate[] };
      return result.templates;
    } catch (error) {
      console.warn('API unavailable for templates, using defaults');
      return this.getDefaultTemplates(category, stakeholderType, language);
    }
  }

  /**
   * Get negotiation flows
   */
  async getNegotiationFlows(productType?: string): Promise<NegotiationFlow[]> {
    try {
      const url = productType
        ? `/api/communication/negotiation-flows?productType=${productType}`
        : '/api/communication/negotiation-flows';
      const result = await apiCall(url) as { flows: NegotiationFlow[] };
      return result.flows;
    } catch (error) {
      console.warn('API unavailable for negotiation flows, using defaults');
      return this.getDefaultNegotiationFlows();
    }
  }

  /**
   * Get contract templates
   */
  async getContractTemplates(type?: string, jurisdiction: string = 'Kenya'): Promise<ContractTemplate[]> {
    try {
      const params = new URLSearchParams({ jurisdiction, ...(type && { type }) });
      const result = await apiCall(`/api/communication/contracts?${params}`) as { contracts: ContractTemplate[] };
      return result.contracts;
    } catch (error) {
      console.warn('API unavailable for contract templates, using defaults');
      return this.getDefaultContractTemplates();
    }
  }

  /**
   * Get quality inspection workflows
   */
  async getInspectionWorkflows(productType?: string): Promise<QualityInspectionWorkflow[]> {
    try {
      const url = productType
        ? `/api/communication/inspections?productType=${productType}`
        : '/api/communication/inspections';
      const result = await apiCall(url) as { workflows: QualityInspectionWorkflow[] };
      return result.workflows;
    } catch (error) {
      console.warn('API unavailable for inspection workflows, using defaults');
      return this.getDefaultInspectionWorkflows();
    }
  }

  /**
   * Generate message from template
   */
  generateMessage(
    template: CommunicationTemplate,
    variables: Record<string, any>
  ): { subject?: string; content: string; missingVariables: string[] } {
    const missingVariables: string[] = [];

    // Check required variables
    template.variables.forEach(variable => {
      if (variable.required && !variables[variable.key] && !variable.defaultValue) {
        missingVariables.push(variable.key);
      }
    });

    if (missingVariables.length > 0) {
      return { content: '', missingVariables };
    }

    // Replace variables in content
    let content = template.content;
    let subject = template.subject;

    template.variables.forEach(variable => {
      const value = variables[variable.key] || variable.defaultValue || '';
      const regex = new RegExp(`{{${variable.key}}}`, 'g');
      content = content.replace(regex, value);
      if (subject) {
        subject = subject.replace(regex, value);
      }
    });

    return { subject, content, missingVariables: [] };
  }

  /**
   * Send templated message
   */
  async sendTemplatedMessage(
    templateId: string,
    senderId: string,
    recipientId: string,
    variables: Record<string, any>,
    attachments?: string[]
  ): Promise<CommunicationInstance> {
    try {
      const result = await apiCall('/api/communication/send', {
        method: 'POST',
        body: JSON.stringify({
          templateId,
          senderId,
          recipientId,
          variables,
          attachments
        })
      }) as { instance: CommunicationInstance };
      return result.instance;
    } catch (error) {
      console.warn('Failed to send templated message:', error);
      throw error;
    }
  }

  /**
   * Start negotiation flow
   */
  async startNegotiationFlow(
    flowId: string,
    initiatorId: string,
    recipientId: string,
    context: Record<string, any>
  ): Promise<string> { // returns negotiation instance ID
    try {
      const result = await apiCall('/api/communication/negotiation/start', {
        method: 'POST',
        body: JSON.stringify({
          flowId,
          initiatorId,
          recipientId,
          context
        })
      }) as { negotiationId: string };
      return result.negotiationId;
    } catch (error) {
      console.warn('Failed to start negotiation flow:', error);
      throw error;
    }
  }

  /**
   * Generate contract from template
   */
  async generateContract(
    templateId: string,
    parties: Record<string, any>,
    variables: Record<string, any>
  ): Promise<string> { // returns contract content
    try {
      const result = await apiCall('/api/communication/contracts/generate', {
        method: 'POST',
        body: JSON.stringify({
          templateId,
          parties,
          variables
        })
      }) as { contract: string };
      return result.contract;
    } catch (error) {
      console.warn('Failed to generate contract:', error);
      return this.generateContractLocally(templateId, parties, variables);
    }
  }

  // Default data methods
  private getDefaultTemplates(category?: string, stakeholderType?: string, language: string = 'en'): CommunicationTemplate[] {
    const allTemplates: CommunicationTemplate[] = [
      {
        id: 'price-negotiation-initial',
        name: 'Initial Price Discussion',
        description: 'Professional template for initiating price negotiations with suppliers',
        category: 'negotiation',
        type: 'message',
        stakeholderType: 'buyer',
        language,
        subject: 'Price Discussion for {{product}} Supply',
        content: `Dear {{recipientName}},

I hope this message finds you well. I'm interested in discussing the supply of {{product}} from your farm. Based on current market rates, I'm looking at a price range of {{priceRange}} per {{unit}}.

Could we discuss:
- Your current pricing structure
- Minimum order quantities
- Payment terms
- Delivery schedules

I'm confident we can reach a mutually beneficial agreement.

Best regards,
{{senderName}}
{{senderRole}}
{{senderContact}}`,
        variables: [
          { key: 'recipientName', label: 'Recipient Name', type: 'text', required: true },
          { key: 'product', label: 'Product Type', type: 'text', required: true },
          { key: 'priceRange', label: 'Price Range', type: 'text', required: true },
          { key: 'unit', label: 'Unit of Measure', type: 'text', required: true },
          { key: 'senderName', label: 'Your Name', type: 'text', required: true },
          { key: 'senderRole', label: 'Your Role', type: 'text', required: true },
          { key: 'senderContact', label: 'Your Contact', type: 'text', required: true }
        ],
        isActive: true,
        usageCount: 0,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'quality-inspection-request',
        name: 'Quality Inspection Request',
        description: 'Official notification for scheduled quality inspections with preparation requirements',
        category: 'inspection',
        type: 'message',
        stakeholderType: 'farmer',
        language,
        subject: 'Quality Inspection Scheduled for {{date}}',
        content: `Dear {{farmerName}},

We have scheduled a quality inspection for your {{product}} delivery on {{date}} at {{time}}.

Please ensure:
- Product is ready for inspection
- All documentation is prepared
- Access to storage facilities
- Representative available on site

Inspection will cover:
- Product quality and condition
- Packaging integrity
- Documentation accuracy
- Storage conditions

Please confirm your availability.

Best regards,
{{inspectorName}}
Quality Assurance Team`,
        variables: [
          { key: 'farmerName', label: 'Farmer Name', type: 'text', required: true },
          { key: 'product', label: 'Product Type', type: 'text', required: true },
          { key: 'date', label: 'Inspection Date', type: 'date', required: true },
          { key: 'time', label: 'Inspection Time', type: 'text', required: true },
          { key: 'inspectorName', label: 'Inspector Name', type: 'text', required: true }
        ],
        isActive: true,
        usageCount: 0,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'contract-proposal',
        name: 'Supply Contract Proposal',
        description: 'Formal contract proposal template for agricultural supply agreements',
        category: 'contract',
        type: 'proposal',
        stakeholderType: 'all',
        language,
        subject: 'Supply Contract Proposal - {{product}}',
        content: `SUPPLY CONTRACT PROPOSAL

This agreement is made between:
{{supplierName}} (Supplier)
and
{{buyerName}} (Buyer)

PRODUCT: {{product}}
QUANTITY: {{quantity}} {{unit}}
PRICE: {{price}} per {{unit}}
DELIVERY SCHEDULE: {{deliverySchedule}}
PAYMENT TERMS: {{paymentTerms}}

Key Terms:
1. Quality Standards: {{qualityStandards}}
2. Delivery Requirements: {{deliveryRequirements}}
3. Force Majeure: {{forceMajeure}}
4. Termination: {{termination}}

Please review and let us know your thoughts.

Best regards,
{{senderName}}`,
        variables: [
          { key: 'supplierName', label: 'Supplier Name', type: 'text', required: true },
          { key: 'buyerName', label: 'Buyer Name', type: 'text', required: true },
          { key: 'product', label: 'Product', type: 'text', required: true },
          { key: 'quantity', label: 'Quantity', type: 'number', required: true },
          { key: 'unit', label: 'Unit', type: 'text', required: true },
          { key: 'price', label: 'Price', type: 'number', required: true },
          { key: 'deliverySchedule', label: 'Delivery Schedule', type: 'text', required: true },
          { key: 'paymentTerms', label: 'Payment Terms', type: 'text', required: true },
          { key: 'qualityStandards', label: 'Quality Standards', type: 'text', required: true },
          { key: 'deliveryRequirements', label: 'Delivery Requirements', type: 'text', required: true },
          { key: 'forceMajeure', label: 'Force Majeure Clause', type: 'text', required: false },
          { key: 'termination', label: 'Termination Clause', type: 'text', required: false },
          { key: 'senderName', label: 'Your Name', type: 'text', required: true }
        ],
        isActive: true,
        usageCount: 0,
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    return allTemplates.filter(template => {
      if (category && template.category !== category) return false;
      if (stakeholderType && template.stakeholderType !== stakeholderType && template.stakeholderType !== 'all') return false;
      return true;
    });
  }

  private getDefaultNegotiationFlows(): NegotiationFlow[] {
    return [
      {
        id: 'bulk-maize-supply',
        name: 'Bulk Maize Supply Negotiation',
        description: 'Structured negotiation flow for bulk maize supply agreements',
        steps: [
          {
            id: 'initial-inquiry',
            name: 'Initial Price Inquiry',
            description: 'Send initial price inquiry with requirements',
            order: 1,
            templateId: 'price-negotiation-initial',
            delayDays: 0,
            requiredResponse: true
          },
          {
            id: 'counter-offer',
            name: 'Counter Offer',
            description: 'Respond to supplier counter-offer',
            order: 2,
            templateId: 'negotiation-counter-offer',
            triggerCondition: 'received_counter_offer',
            delayDays: 1,
            requiredResponse: true
          },
          {
            id: 'terms-negotiation',
            name: 'Terms Negotiation',
            description: 'Discuss delivery and payment terms',
            order: 3,
            templateId: 'terms-discussion',
            delayDays: 2,
            requiredResponse: true
          },
          {
            id: 'contract-proposal',
            name: 'Contract Proposal',
            description: 'Send formal contract proposal',
            order: 4,
            templateId: 'contract-proposal',
            delayDays: 1,
            requiredResponse: true
          }
        ],
        applicableTo: ['maize', 'grain'],
        estimatedDuration: 14
      }
    ];
  }

  private getDefaultContractTemplates(): ContractTemplate[] {
    return [
      {
        id: 'supply-agreement',
        name: 'Agricultural Supply Agreement',
        type: 'supply',
        jurisdiction: 'Kenya',
        language: 'en',
        sections: [
          {
            id: 'parties',
            title: 'Parties to the Agreement',
            content: 'This Agreement is made between {{supplierName}}... and {{buyerName}}...',
            required: true,
            order: 1,
            variables: ['supplierName', 'buyerName']
          },
          {
            id: 'products',
            title: 'Products and Specifications',
            content: 'The Supplier agrees to supply {{product}} meeting the specifications...',
            required: true,
            order: 2,
            variables: ['product']
          }
        ],
        variables: [
          { key: 'supplierName', label: 'Supplier Name', type: 'text', required: true },
          { key: 'buyerName', label: 'Buyer Name', type: 'text', required: true },
          { key: 'product', label: 'Product', type: 'text', required: true }
        ],
        legalReviewRequired: true,
        autoRenewal: false,
        terminationClauses: ['material breach', 'insolvency', 'force majeure']
      }
    ];
  }

  private getDefaultInspectionWorkflows(): QualityInspectionWorkflow[] {
    return [
      {
        id: 'maize-quality-inspection',
        name: 'Maize Quality Inspection',
        productType: 'maize',
        checkpoints: [
          {
            id: 'visual-inspection',
            name: 'Visual Inspection',
            description: 'Check for physical damage, discoloration, or foreign matter',
            type: 'visual',
            criteria: 'No more than 5% damaged kernels',
            weight: 0.3,
            photosRequired: true,
            notesRequired: true
          },
          {
            id: 'moisture-content',
            name: 'Moisture Content Test',
            description: 'Measure moisture content using approved testing equipment',
            type: 'measurement',
            criteria: '12-14% moisture content',
            acceptableValues: ['12%', '13%', '14%'],
            weight: 0.4,
            photosRequired: false,
            notesRequired: true
          },
          {
            id: 'documentation-check',
            name: 'Documentation Verification',
            description: 'Verify all required documentation is present and accurate',
            type: 'documentation',
            criteria: 'All documents present and accurate',
            weight: 0.3,
            photosRequired: false,
            notesRequired: true
          }
        ],
        automatedScoring: true,
        requiredApprovals: 1,
        escalationThreshold: 70
      }
    ];
  }

  private generateContractLocally(
    templateId: string,
    parties: Record<string, any>,
    variables: Record<string, any>
  ): string {
    // Fallback contract generation
    const template = this.getDefaultContractTemplates().find(t => t.id === templateId);
    if (!template) {
      throw new Error('Contract template not found');
    }

    let contract = `AGRICULTURAL SUPPLY CONTRACT

Generated on: ${new Date().toLocaleDateString()}

`;

    template.sections.forEach(section => {
      contract += `${section.title.toUpperCase()}\n\n`;
      let content = section.content;

      // Replace variables
      Object.entries(variables).forEach(([key, value]) => {
        content = content.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      });

      contract += `${content}\n\n`;
    });

    contract += `Executed on: ${new Date().toLocaleDateString()}\n`;
    contract += `This contract is legally binding under Kenyan law.\n`;

    return contract;
  }
}