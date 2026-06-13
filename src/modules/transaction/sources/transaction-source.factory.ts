import { Injectable } from '@nestjs/common';
import { ITransactionSource } from './transaction-source.interface';
import { InternalLedgerSource } from './internal-ledger.source';
import { StripeIssuingSource } from './stripe-issuing.source';
import { AdyenSource } from './adyen.source';
import { NetsSource } from './nets.source';
import { Company } from '../../company/entities/company.entity';

export type PaymentProvider = 'internal' | 'stripe' | 'adyen' | 'nets';

@Injectable()
export class TransactionSourceFactory {
  constructor(
    private readonly internalLedger: InternalLedgerSource,
    private readonly stripe: StripeIssuingSource,
    private readonly adyen: AdyenSource,
    private readonly nets: NetsSource,
  ) {}

  forCompany(company: Company): ITransactionSource {
    return this.create(company.payment_provider as PaymentProvider ?? 'internal');
  }

  create(provider: PaymentProvider): ITransactionSource {
    switch (provider) {
      case 'stripe': return this.stripe;
      case 'adyen':  return this.adyen;
      case 'nets':   return this.nets;
      default:       return this.internalLedger;
    }
  }
}
