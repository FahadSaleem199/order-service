const { Service } = require('@g-network/service-chassis');

class AppointmentService extends Service {
  async getCollection(queryParams) {
    try {
      return await this.external.appointmentService.get(`/appointment`, {
        query: queryParams,
      });
    } catch (e) {
      return { data: [] };
    }
  }
}

module.exports = AppointmentService;
