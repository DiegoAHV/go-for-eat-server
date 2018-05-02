'use strict';

const Raven = require('raven');

class MeetingsController {
  constructor (Meetings) {
    this.Meetings = Meetings;
  }

  async createMeeting (ctx, next) {
    if ('POST' != ctx.method) return await next();
    // console.log(ctx.header);

    const { date, time, seats } = ctx.request.body;
    // get the accestoken from header and store it in organiser

    const organiser = ctx.user._id;
    if (!date || !time || !seats ) {
      ctx.status = 400;
      ctx.body = 'Please complete all fields';
      return;
    }
    try {
      //TODO add time spread check
      const dateCheck = await this.Meetings.findOne({date});
      if (dateCheck) {
        ctx.status = 400;
        ctx.body = 'You already have a meeting on that date\nPlease choose another day';
        return;
      }
    } catch (e) {
      Raven.captureException(e);
      ctx.status = 500;
    }
    const newMeeting = {
      date,
      time,
      seats,
      organiser,
      timestamp: Date.now(),
    };

    const meeting = await this.Meetings.insert(newMeeting);

    ctx.status = 201;

    ctx.body = 'Event created!';
  }

  async deleteMeeting (ctx, next) {
    if ('DELETE' != ctx.method) return await next();

    try {
      const meetingId = ctx.params.meeting_id;
      const meeting = await this.Meetings.findOneAndDelete(
        { _id : meetingId }
      );

      // if (meeting && meeting.attendees.length === ) {
      //   await this.Events.remove({ _id: paramId });
      // } else return (ctx.status = 404);
      // ctx.status = 204;
    } catch (e) {
      Raven.captureException(e);
      ctx.status = 500;
    }
    ctx.status = 201;

    ctx.body = 'Meeting deleted!';
  }

  async readMeeting (ctx, next) {
    if ('GET' != ctx.method) return await next();
    try {
      const organiserId = ctx.params.restaurant;
      console.log('HERES ORGANISER ID', organiserId);
      console.log('HERES ORGANISER ID type',typeof organiserId);

      const meetings = await this.Meetings.find(
        // [
        // {$project:{'organiser' : 1}},
        // {$match: { organiserId}}
      // ]
      // { organiser:ObjectId ('5ae9ac7a225a591208ed2460') }
      {seats : '300'}
      );
      console.log(meetings);

      ctx.status = 200;
      ctx.body = meetings;
    } catch (e) {
      Raven.captureException(e);
      ctx.status = 500;
    }
  }

  async updateMeeting (ctx, next) {
    const restaurant = ctx.user;
    if ('PUT' != ctx.method) return await next();

    //filter invalid inputs
    const update = ctx.request.body;
    console.log(update);

    try {
      const meetingId = ctx.params.meeting_id;
      const meeting = await this.Meetings.findOneAndUpdate(
        { _id : meetingId },
        update
      );

      // if (meeting && meeting.attendees.length === ) {
      //   await this.Events.remove({ _id: paramId });
      // } else return (ctx.status = 404);
      // ctx.status = 204;
    } catch (e) {
      Raven.captureException(e);
      ctx.status = 500;
    }
    ctx.status = 201;

    ctx.body = 'Meeting updated!';
  }

}

module.exports = MeetingsController;
