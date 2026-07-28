import {
  getCapability,
  getCurrentAsset
} from "../../config/capabilityRegistry";
import type {
  CampaignProposalDraft,
  FeasibilityAssessment
} from "../../types/agent";

export function assessCampaignFeasibility(
  proposal: CampaignProposalDraft
): FeasibilityAssessment {
  const capabilities = proposal.requiredCapabilities.map((id) => getCapability(id));
  const missingCapabilityIds = proposal.requiredCapabilities.filter(
    (_, index) => !capabilities[index]
  );
  const plannedAssetCapabilities = capabilities.filter(
    (capability) =>
      capability?.availability === "planned"
      && "requiresAssetCreation" in capability
      && capability.requiresAssetCreation
  );
  const plannedEngineeringCapabilities = capabilities.filter(
    (capability) =>
      capability?.availability === "planned"
      && !("requiresAssetCreation" in capability
        && capability.requiresAssetCreation)
  );
  const experimentalCapabilities = capabilities.filter(
    (capability) => capability?.availability === "experimental"
  );
  const missingAssets = proposal.eligibleAssetIds.filter((id) => !getCurrentAsset(id));

  if (plannedAssetCapabilities.length > 0 || missingAssets.length > 0) {
    return {
      status: "requires_asset_creation",
      canApprove: false,
      canPublish: false,
      reasons: [
        ...plannedAssetCapabilities.map(
          (capability) => `${capability?.label ?? "Planned asset"}: ${capability?.description ?? "New assets are required."}`
        ),
        ...missingAssets.map((id) => `${id} is not registered as a current asset.`)
      ]
    };
  }

  if (missingCapabilityIds.length > 0 || plannedEngineeringCapabilities.length > 0) {
    return {
      status: "requires_engineering",
      canApprove: false,
      canPublish: false,
      reasons: [
        ...missingCapabilityIds.map((id) => `${id} is not registered.`),
        ...plannedEngineeringCapabilities.map(
          (capability) => `${capability?.label ?? "Planned capability"} still requires engineering.`
        )
      ]
    };
  }

  if (experimentalCapabilities.length > 0) {
    return {
      status: "requires_configuration",
      canApprove: true,
      canPublish: false,
      reasons: experimentalCapabilities.map(
        (capability) => `${capability?.label ?? "Capability"} remains an explicit demo or configuration boundary.`
      )
    };
  }

  return {
    status: "available_now",
    canApprove: true,
    canPublish: true,
    reasons: ["All required capabilities and referenced assets are available now."]
  };
}
