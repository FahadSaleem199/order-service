const SalesforceModel = require('@g-network/salesforce-models');

class Contact extends SalesforceModel {
  static async getByExternalId(id) {
    return (
      await this.query()
        .find(
          { External_ID__c: id },
          {
            Id: 1,
            Company_Name__c: 1,
            FirstName: 1,
            LastName: 1,
            Phone: 1,
            Email: 1,
            Street__c: 1,
            Building__c: 1,
            Flat__c: 1,
            Organisation_Name__c: 1,
            'RecordType.Name': 1,
          },
        )
        .limit(1)
    )[0];
  }

  static updateById({ id, firstName, lastName, email, telephone, companyName, flat, organisation }) {
    return this.query().update({
      Id: id,
      FirstName: firstName,
      LastName: lastName,
      Phone: telephone,
      Email: email,
      Company_Name__c: companyName,
      Flat__c: flat,
      Organisation_Name__c: organisation,
    });
  }
}

Contact.sobjectType = 'Contact';

module.exports = Contact;
