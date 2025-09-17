import { Request, Response } from 'express';
import {
  InsurancePolicy,
  InsuranceClaim,
  RiskAssessment,
  WeatherReading,
  ClaimStatus,
  PolicyStatus,
  IInsurancePolicy,
  IInsuranceClaim,
  IWeatherReading
} from '../models/insurance.model';
import { User } from '../models/user.model';
import { logger } from '../utils/logger';

export class InsuranceController {
  // Internal function for risk assessment (placeholder)
  private async assessInsuranceRisk(policyData: any): Promise<{
    insuranceRiskScore: string;
    riskFactors: string[];
    status: string;
  }> {
    // Placeholder implementation - in real app this would call AI service
    const riskScore = (Math.random() * 10).toFixed(2);
    const riskFactors = [
      "High flood risk in region",
      "Lack of documented pest management",
      "Monocropping practice",
    ];

    return {
      insuranceRiskScore: riskScore,
      riskFactors,
      status: "assessment_complete",
    };
  }

  // Internal function for claim verification (placeholder)
  private async verifyClaim(claimData: any): Promise<{
    status: string;
    payoutAmount: number;
    assessmentDetails: any;
  }> {
    // Placeholder implementation - in real app this would call AI service
    const isApproved = Math.random() > 0.3;
    const payoutAmount = isApproved ? Math.floor(Math.random() * 1000) + 100 : 0;

    return {
      status: isApproved ? "approved" : "rejected",
      payoutAmount,
      assessmentDetails: {
        verificationLog: "Weather data confirmed drought during incident period. Farm activity logs consistent.",
        dataPointsConsidered: [
          "weather_data",
          "farm_activity_logs",
          "vti_events",
        ],
      },
    };
  }

  async processInsuranceApplication(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const {
        insurerId,
        coverageAmount,
        currency,
        premium,
        startDate,
        endDate,
        insuredAssets,
        parametricThresholds
      } = req.body;

      if (!insurerId || !coverageAmount || !premium || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if insurer exists and has correct role
      const insurer = await User.findById(insurerId);
      if (!insurer) {
        return res.status(404).json({ error: 'Insurer not found' });
      }

      const policy = new InsurancePolicy({
        policyId: `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        policyholder: userId,
        insurer: insurerId,
        coverageAmount,
        currency: currency || 'USD',
        premium,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        insuredAssets: insuredAssets || [],
        parametricThresholds,
      });

      await policy.save();

      // Trigger risk assessment
      await this.performRiskAssessment(policy);

      res.json({
        success: true,
        policyId: policy.policyId,
        message: 'Insurance application submitted successfully'
      });
    } catch (error) {
      logger.error('Error processing insurance application:', error);
      res.status(500).json({ error: 'Failed to process insurance application' });
    }
  }

  private async performRiskAssessment(policy: IInsurancePolicy) {
    try {
      // Get policy details with populated data
      const populatedPolicy = await InsurancePolicy.findById(policy._id)
        .populate('policyholder')
        .populate('insuredAssets.asset');

      if (!populatedPolicy) return;

      const assessmentData = {
        policyDetails: populatedPolicy,
        policyholderDetails: populatedPolicy.policyholder,
        insuredAssetsDetails: populatedPolicy.insuredAssets,
      };

      const assessmentResult = await this.assessInsuranceRisk(assessmentData);

      const riskAssessment = new RiskAssessment({
        assessmentId: `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user: populatedPolicy.policyholder._id,
        policy: populatedPolicy._id,
        score: parseFloat(assessmentResult.insuranceRiskScore),
        riskFactors: assessmentResult.riskFactors,
        recommendations: {
          en: [
            "Improve irrigation systems",
            "Diversify crops",
          ],
          local: {
            es: ["Mejorar sistemas de riego", "Diversificar cultivos"],
          },
        },
      });

      await riskAssessment.save();

      // Update policy with risk assessment reference
      await InsurancePolicy.findByIdAndUpdate(policy._id, {
        riskAssessment: riskAssessment._id,
      });

      logger.info(`Risk assessment completed for policy ${policy.policyId}`);
    } catch (error) {
      logger.error('Error performing risk assessment:', error);
    }
  }

  async submitInsuranceClaim(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const {
        policyId,
        incidentDate,
        claimedAmount,
        currency,
        description,
        supportingDocumentsUrls
      } = req.body;

      if (!policyId || !incidentDate || !claimedAmount || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if policy exists and belongs to user
      const policy = await InsurancePolicy.findOne({
        policyId,
        policyholder: userId,
        status: PolicyStatus.ACTIVE
      });

      if (!policy) {
        return res.status(404).json({ error: 'Policy not found or not active' });
      }

      const claim = new InsuranceClaim({
        claimId: `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        policy: policy._id,
        policyholder: userId,
        insurer: policy.insurer,
        incidentDate: new Date(incidentDate),
        claimedAmount,
        currency: currency || 'USD',
        description,
        supportingDocumentsUrls,
      });

      await claim.save();

      // Trigger claim processing
      await this.processClaim(claim);

      res.json({
        success: true,
        claimId: claim.claimId,
        message: 'Insurance claim submitted successfully'
      });
    } catch (error) {
      logger.error('Error submitting insurance claim:', error);
      res.status(500).json({ error: 'Failed to submit insurance claim' });
    }
  }

  private async processClaim(claim: IInsuranceClaim) {
    try {
      // Get claim details with populated data
      const populatedClaim = await InsuranceClaim.findById(claim._id)
        .populate('policy')
        .populate('policyholder');

      if (!populatedClaim || !populatedClaim.policy) return;

      const claimVerificationData = {
        claimDetails: populatedClaim,
        policyDetails: populatedClaim.policy,
        insuredAssetsDetails: (populatedClaim.policy as any).insuredAssets || [],
      };

      const claimResult = await this.verifyClaim(claimVerificationData);

      const updateData: any = {
        status: claimResult.status === 'approved' ? ClaimStatus.APPROVED : ClaimStatus.REJECTED,
        assessmentDetails: claimResult.assessmentDetails,
      };

      if (claimResult.status === 'approved' && claimResult.payoutAmount > 0) {
        updateData.payoutAmount = claimResult.payoutAmount;
        updateData.payoutDate = new Date();
      }

      await InsuranceClaim.findByIdAndUpdate(claim._id, updateData);

      logger.info(`Claim ${claim.claimId} processing complete. Status: ${updateData.status}`);
    } catch (error) {
      logger.error('Error processing claim:', error);
      await InsuranceClaim.findByIdAndUpdate(claim._id, {
        status: ClaimStatus.PROCESSING_ERROR,
        assessmentDetails: { error: (error as Error).message },
      });
    }
  }

  async getInsurancePolicies(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { status } = req.query;

      const query: any = { policyholder: userId };
      if (status) {
        query.status = status;
      }

      const policies = await InsurancePolicy.find(query)
        .populate('insurer', 'name email')
        .populate('riskAssessment')
        .sort({ createdAt: -1 });

      const formattedPolicies = policies.map(policy => ({
        id: policy._id,
        policyId: policy.policyId,
        insurer: {
          id: (policy as any).insurer._id,
          name: (policy as any).insurer.name,
          email: (policy as any).insurer.email,
        },
        coverageAmount: policy.coverageAmount,
        currency: policy.currency,
        premium: policy.premium,
        status: policy.status,
        startDate: policy.startDate.toISOString(),
        endDate: policy.endDate.toISOString(),
        insuredAssets: policy.insuredAssets,
        parametricThresholds: policy.parametricThresholds,
        riskAssessment: policy.riskAssessment ? {
          score: (policy as any).riskAssessment.score,
          riskFactors: (policy as any).riskAssessment.riskFactors,
          recommendations: (policy as any).riskAssessment.recommendations,
        } : null,
        createdAt: policy.createdAt.toISOString(),
      }));

      res.json({ policies: formattedPolicies });
    } catch (error) {
      logger.error('Error fetching insurance policies:', error);
      res.status(500).json({ error: 'Failed to fetch insurance policies' });
    }
  }

  async getInsuranceClaims(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userId = (req.user as any).userId || (req.user as any).id;
      const { status } = req.query;

      const query: any = {
        $or: [
          { policyholder: userId },
          { insurer: userId }
        ]
      };

      if (status) {
        query.status = status;
      }

      const claims = await InsuranceClaim.find(query)
        .populate('policy', 'policyId coverageAmount currency')
        .populate('policyholder', 'name email')
        .populate('insurer', 'name email')
        .sort({ createdAt: -1 });

      const formattedClaims = claims.map(claim => ({
        id: claim._id,
        claimId: claim.claimId,
        policy: {
          id: (claim as any).policy._id,
          policyId: (claim as any).policy.policyId,
          coverageAmount: (claim as any).policy.coverageAmount,
          currency: (claim as any).policy.currency,
        },
        policyholder: {
          id: (claim as any).policyholder._id,
          name: (claim as any).policyholder.name,
          email: (claim as any).policyholder.email,
        },
        insurer: {
          id: (claim as any).insurer._id,
          name: (claim as any).insurer.name,
          email: (claim as any).insurer.email,
        },
        incidentDate: claim.incidentDate.toISOString(),
        submissionDate: claim.submissionDate.toISOString(),
        status: claim.status,
        claimedAmount: claim.claimedAmount,
        currency: claim.currency,
        description: claim.description,
        supportingDocumentsUrls: claim.supportingDocumentsUrls,
        assessmentDetails: claim.assessmentDetails,
        payoutAmount: claim.payoutAmount,
        payoutDate: claim.payoutDate?.toISOString(),
      }));

      res.json({ claims: formattedClaims });
    } catch (error) {
      logger.error('Error fetching insurance claims:', error);
      res.status(500).json({ error: 'Failed to fetch insurance claims' });
    }
  }

  async createWeatherReading(req: Request, res: Response) {
    try {
      const {
        location,
        timestamp,
        temperature,
        humidity,
        rainfall,
        windSpeed,
        windDirection,
        pressure,
        source
      } = req.body;

      if (!location || !location.coordinates || !timestamp || !source) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const weatherReading = new WeatherReading({
        location: {
          type: 'Point',
          coordinates: location.coordinates,
        },
        timestamp: new Date(timestamp),
        temperature,
        humidity,
        rainfall,
        windSpeed,
        windDirection,
        pressure,
        source,
      });

      await weatherReading.save();

      // Check for parametric payouts
      await this.checkParametricPayouts(weatherReading);

      res.json({
        success: true,
        readingId: weatherReading._id,
        message: 'Weather reading recorded successfully'
      });
    } catch (error) {
      logger.error('Error creating weather reading:', error);
      res.status(500).json({ error: 'Failed to create weather reading' });
    }
  }

  private async checkParametricPayouts(weatherReading: IWeatherReading) {
    try {
      // Find policies with parametric thresholds that might be triggered
      const policies = await InsurancePolicy.find({
        'parametricThresholds.rainfall': { $exists: true },
        status: PolicyStatus.ACTIVE,
      });

      for (const policy of policies) {
        if (!policy.parametricThresholds?.rainfall) continue;

        const threshold = policy.parametricThresholds.rainfall;
        if (weatherReading.rainfall && weatherReading.rainfall > threshold.threshold) {
          // Create parametric claim
          const payoutAmount = (policy.coverageAmount * threshold.payoutPercentage) / 100;

          const claim = new InsuranceClaim({
            claimId: `parametric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            policy: policy._id,
            policyholder: policy.policyholder,
            insurer: policy.insurer,
            incidentDate: weatherReading.timestamp,
            claimedAmount: payoutAmount,
            currency: policy.currency,
            description: `Parametric payout triggered by weather event (rainfall: ${weatherReading.rainfall})`,
            status: ClaimStatus.APPROVED,
            payoutAmount,
            payoutDate: new Date(),
            assessmentDetails: {
              trigger: 'parametric_weather',
              weatherReadingId: weatherReading._id,
              rainfall: weatherReading.rainfall,
              threshold: threshold.threshold,
              payoutPercentage: threshold.payoutPercentage,
            },
          });

          await claim.save();
          logger.info(`Parametric claim created for policy ${policy.policyId}`);
        }
      }
    } catch (error) {
      logger.error('Error checking parametric payouts:', error);
    }
  }
}