import { FlattenMaps } from "mongoose";
import airbnbDataModel, { AirbnbDataModel } from "../database/model/airbnbDataModel";
import { AirbnbData } from "../types/airbnbData";

type AirbnbDoc = FlattenMaps<AirbnbDataModel> & {
  _id: string;
};

const convertAirbnbDocToAirbnbData = (airbnbDoc: AirbnbDoc) => {
  const airbnbData: AirbnbData = {
    id: airbnbDoc._id,
    listing_url: airbnbDoc.listing_url,
    name: airbnbDoc.name,
    summary: airbnbDoc.summary,
    space: airbnbDoc.space,
    description: airbnbDoc.description,
    neighborhood_overview: airbnbDoc.neighborhood_overview,
    notes: airbnbDoc.notes,
    transit: airbnbDoc.transit,
    access: airbnbDoc.access,
    interaction: airbnbDoc.interaction,
    house_rules: airbnbDoc.house_rules,
    property_type: airbnbDoc.property_type,
    room_type: airbnbDoc.room_type,
    bed_type: airbnbDoc.bed_type,
    minimum_nights: airbnbDoc.minimum_nights,
    maximum_nights: airbnbDoc.maximum_nights,
    cancellation_policy: airbnbDoc.cancellation_policy,
    last_scraped: airbnbDoc.last_scraped,
    calendar_last_scraped: airbnbDoc.calendar_last_scraped,
    first_review: airbnbDoc.first_review,
    last_review: airbnbDoc.last_review,
    accommodates: airbnbDoc.accommodates,
    bedrooms: airbnbDoc.bedrooms,
    beds: airbnbDoc.beds,
    number_of_reviews: airbnbDoc.number_of_reviews,
    bathrooms: parseFloat(airbnbDoc.bathrooms?.toString() ?? "0.00"),
    amenities: [...airbnbDoc.amenities],
    price: parseFloat(airbnbDoc.price?.toString() ?? "0.00"),
    weekly_price: parseFloat(airbnbDoc.weekly_price?.toString() ?? "0.00"),
    monthly_price: parseFloat(airbnbDoc.monthly_price?.toString() ?? "0.00"),
    cleaning_fee: parseFloat(airbnbDoc.cleaning_fee?.toString() ?? "0.00"),
    security_deposit: parseFloat(airbnbDoc.security_deposit?.toString() ?? "0.00"),
    extra_people: parseFloat(airbnbDoc.extra_people?.toString() ?? "0.00"),
    guests_included: parseFloat(airbnbDoc.guests_included?.toString() ?? "0.00"),
    images: { ...airbnbDoc.images },
    host: { ...airbnbDoc.host },
    address: { ...airbnbDoc.address },
    reviews: [...airbnbDoc.reviews.map(r => ({ id: r._id, ...r, _id: undefined }))],
    review_scores: { ...airbnbDoc.review_scores },
  };

  return airbnbData;
};

export const airbnbDataService = {
  getPaginatedData: async (pageNumber: number, pageSize: number) => {
    const airbnbDataDoc = await airbnbDataModel
      .find()
      .sort({ _id: 1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return airbnbDataDoc?.map(d => convertAirbnbDocToAirbnbData(d)) ?? [];
  },

  getData: async (id: string) => {
    const airbnbDataDoc = await airbnbDataModel.findOne({ _id: id }).lean();

    if (!airbnbDataDoc) {
      return null;
    }

    return convertAirbnbDocToAirbnbData(airbnbDataDoc);
  },
};
