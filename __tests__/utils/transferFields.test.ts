import { buildBeneficiary, fieldOptions } from '../../utils/transferFields';

describe('transfer beneficiary fields', () => {
  const options = fieldOptions({
    credit_party_identifier: [['msisdn'], ['bank_account_number', 'swift_bic_code']],
    beneficiary: [['firstname', 'lastname']],
  });

  it('keeps each section and its alternative combinations', () => {
    expect(options.credit_party_identifier).toHaveLength(2);
    expect(options.beneficiary).toEqual([['firstname', 'lastname']]);
  });

  it('sends only the chosen combination', () => {
    const body = buildBeneficiary(options, { credit_party_identifier: 0, beneficiary: 0 }, {
      'credit_party_identifier.msisdn': '258840000000',
      'credit_party_identifier.bank_account_number': '999',
      'beneficiary.firstname': 'Ana',
      'beneficiary.lastname': '',
    });
    expect(body).toEqual({ credit_party_identifier: { msisdn: '258840000000' }, beneficiary: { firstname: 'Ana' } });
  });
});
