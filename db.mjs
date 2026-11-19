// The app's Prisma ORM data contract, emitted from src/prisma/contract.prisma
// by `prisma contract emit`. Both the service declaration's database
// dependency and the module's provisioned database reference this one value.
import { dataContract } from '@prisma/composer-prisma-cloud/orm';
import contractJson from './src/prisma/contract.json' with { type: 'json' };

export default dataContract(contractJson);
