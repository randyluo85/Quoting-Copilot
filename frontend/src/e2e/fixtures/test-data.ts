/**
 * E2E 测试数据
 */

import { Product, ProjectOwner } from '../../lib/api';

/**
 * 默认产品数据
 */
export const defaultProducts: Product[] = [
  {
    id: 'P-001',
    name: '测试产品A',
    partNumber: 'TEST-A-001',
    annualVolume: 10000,
    description: '测试产品描述',
  },
];

/**
 * 默认负责人数据
 */
export const defaultOwners: ProjectOwner = {
  sales: '张三',
  vm: '李四',
  ie: '王五',
  controlling: '钱七',
};

/**
 * 测试项目数据
 */
export const testProjectData = {
  asacNumber: `AS-TEST-${Date.now()}`,
  customerNumber: `TEST-${Date.now()}`,
  productVersion: 'V1.0',
  customerVersion: 'C1.0',
  clientName: '测试客户',
  projectName: `测试项目-${Date.now()}`,
  annualVolume: '10000',
  description: '这是一个自动化测试创建的项目',
  products: defaultProducts,
  owners: defaultOwners,
};

/**
 * 生成唯一的测试数据
 */
export function generateTestProject() {
  const timestamp = Date.now();
  return {
    asacNumber: `AS-E2E-${timestamp}`,
    customerNumber: `E2E-${timestamp}`,
    productVersion: 'V1.0',
    customerVersion: 'C1.0',
    clientName: 'E2E测试客户',
    projectName: `E2E测试项目-${timestamp}`,
    annualVolume: '10000',
    description: 'E2E 自动化测试项目',
    products: [
      {
        id: 'P-E2E-001',
        name: 'E2E测试产品',
        partNumber: 'E2E-001',
        annualVolume: 10000,
        description: 'E2E测试产品描述',
      },
    ],
    owners: {
      sales: 'E2E销售',
      vm: 'E2E项目经理',
      ie: 'E2E工艺',
      controlling: 'E2E财务',
    },
  };
}
