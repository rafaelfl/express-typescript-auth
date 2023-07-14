import mongoose, { Document } from "mongoose";

const { Schema } = mongoose;

export interface AirbnbDataModel extends Document {
  listing_url: string;
  name: string;
  summary: string;
  space: string;
  description: string;
  neighborhood_overview: string;
  notes: string;
  transit: string;
  access: string;
  interaction: string;
  house_rules: string;
  property_type: string;
  room_type: string;
  bed_type: string;
  minimum_nights: string;
  maximum_nights: string;
  cancellation_policy: string;
  last_scraped: Date;
  calendar_last_scraped: Date;
  first_review: Date;
  last_review: Date;
  accommodates: number;
  bedrooms: number;
  beds: number;
  number_of_reviews: number;
  bathrooms: number;
  amenities: Array<string>;
  price: number;
  weekly_price: number;
  monthly_price: number;
  security_deposit: number;
  cleaning_fee: number;
  extra_people: number;
  guests_included: number;
  images: {
    thumbnail_url: string;
    medium_url: string;
    picture_url: string;
    xl_picture_url: string;
  };
  host: {
    host_id: string;
    host_url: string;
    host_name: string;
    host_location: string;
    host_about: string;
    host_response_time?: string;
    host_thumbnail_url: string;
    host_picture_url: string;
    host_neighbourhood: string;
    host_response_rate: number;
    host_is_superhost: boolean;
    host_has_profile_pic: boolean;
    host_identity_verified: boolean;
    host_listings_count: number;
    host_total_listings_count: number;
    host_verifications: Array<string>;
  };
  address: {
    street: string;
    suburb: string;
    government_area: string;
    market: string;
    country: string;
    country_code: string;
    location: {
      type: string;
      coordinates: Array<number>;
      is_location_exact: boolean;
    };
  };
  reviews: Array<{
    _id: string;
    date: Date;
    listing_id: string;
    reviewer_id: string;
    reviewer_name: string;
    comments: string;
  }>;
}

const AirbnbImagesSchema = new Schema({
  thumbnail_url: String,
  medium_url: String,
  picture_url: String,
  xl_picture_url: String,
});

const AirbnbHostSchema = new Schema({
  host_id: String,
  host_url: String,
  host_name: String,
  host_location: String,
  host_about: String,
  host_response_time: String,
  host_thumbnail_url: String,
  host_picture_url: String,
  host_neighbourhood: String,
  host_response_rate: Number,
  host_is_superhost: Boolean,
  host_has_profile_pic: Boolean,
  host_identity_verified: Boolean,
  host_listings_count: Number,
  host_total_listings_count: Number,
  host_verifications: [String],
});

const AirbnbAddressSchema = new Schema({
  street: String,
  suburb: String,
  government_area: String,
  market: String,
  country: String,
  country_code: String,
  location: new Schema({
    type: String,
    coordinates: [Number],
    is_location_exact: Boolean,
  }),
});

const AirbnbReviewsSchema = new Schema({
  _id: String,
  date: Date,
  listing_id: String,
  reviewer_id: String,
  reviewer_name: String,
  comments: String,
});

const AirbnbDataSchema = new Schema(
  {
    _id: String,
    listing_url: String,
    name: String,
    summary: String,
    space: String,
    description: String,
    neighborhood_overview: String,
    notes: String,
    transit: String,
    access: String,
    interaction: String,
    house_rules: String,
    property_type: String,
    room_type: String,
    bed_type: String,
    minimum_nights: String,
    maximum_nights: String,
    cancellation_policy: String,
    last_scraped: Date,
    calendar_last_scraped: Date,
    first_review: Date,
    last_review: Date,
    accommodates: Number,
    bedrooms: Number,
    beds: Number,
    number_of_reviews: Number,
    bathrooms: Number,
    amenities: [String],
    price: Number,
    weekly_price: Number,
    monthly_price: Number,
    security_deposit: Number,
    cleaning_fee: Number,
    extra_people: Number,
    guests_included: Number,
    images: AirbnbImagesSchema,
    host: AirbnbHostSchema,
    address: AirbnbAddressSchema,
    reviews: [AirbnbReviewsSchema],
  },
  { collection: "airbnbSampleData" },
);

export default mongoose.model<AirbnbDataModel>("AirbnbData", AirbnbDataSchema);
