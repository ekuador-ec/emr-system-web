import type { OrganizationConfig } from '@/domain/modules/medical-record/models/OrganizationConfig';

export const OrganizationConfigMapper = {
  toDomain: (data: any): OrganizationConfig => ({
    id: data.id,
    institutionName: data.institution_name,
    operationalUnit: data.operational_unit,
    operationalUnitCode: data.operational_unit_code,
    provinceCode: data.province_code,
    cantonCode: data.canton_code,
    parishCode: data.parish_code,
    updatedAt: data.updated_at,
    updatedBy: data.updated_by,
  }),
  toPersistence: (domain: Partial<OrganizationConfig>): any => {
    const persistence: any = {};
    if (domain.institutionName !== undefined) persistence.institution_name = domain.institutionName;
    if (domain.operationalUnit !== undefined) persistence.operational_unit = domain.operationalUnit;
    if (domain.operationalUnitCode !== undefined) persistence.operational_unit_code = domain.operationalUnitCode;
    if (domain.provinceCode !== undefined) persistence.province_code = domain.provinceCode;
    if (domain.cantonCode !== undefined) persistence.canton_code = domain.cantonCode;
    if (domain.parishCode !== undefined) persistence.parish_code = domain.parishCode;
    return persistence;
  },
};
