select test.assert_that(public.guide_price_of(60, 'ghost', 100, 100) = 141750, 'a 60 lb ghost in perfect condition with fame 100 is the endgame fish');
select test.assert_that(public.guide_price_of(8, 'common', 100, 0) = 240, 'an 8 lb common is £240');
select test.assert_that(public.guide_price_of(30, 'common', 100, 0) = 3000, 'a thirty is £3,000');
select test.assert_that(public.guide_price_of(40, 'mirror', 50, 0) = round(8500 * 1.05 * 0.8), 'condition 50 is worth 0.8');
select test.assert_that(public.guide_price_of(10, 'common', 100, 0) = 300, 'the top of the first band');
select test.assert_that(public.guide_price_of(20, 'common', 100, 0) = 1000, 'the top of the second band');
select test.assert_that(public.guide_price_of(50, 'common', 100, 0) = 22500, 'the top of the fifth band');
select test.assert_that(public.guide_price_of(20, 'linear', 100, 0) = 1200, 'a linear is worth 1.2');
select test.assert_that(public.guide_price_of(20, 'fully_scaled', 100, 0) = 1250, 'a fully scaled is worth 1.25');
select test.assert_that(public.guide_price_of(20, 'leather', 100, 0) = 1300, 'a leather is worth 1.3');
select test.assert_that(public.guide_price_of(20, 'common', 100, 500) = 2500, 'fame is capped at 1.5');
select test.assert_that(public.guide_price_of(20, 'common', 0, 0) = 600, 'condition 0 is worth 0.6');
select test.assert_that(public.guide_price_of(25, 'mirror', 90, 0) = 2016, 'matches valuation.ts for a 25 lb mirror at 90');


select test.assert_that(public.haversine_km(51.5074, -0.1278, 48.8566, 2.3522) = 343.6, 'London to Paris matches greatCircle.ts');
select test.assert_that(public.haversine_km(51.5074, -0.1278, 52.52, 13.405) = 931.6, 'London to Berlin');
select test.assert_that(public.haversine_km(51.5074, -0.1278, -33.8688, 151.2093) = 16993.9, 'London to Sydney');
select test.assert_that(public.haversine_km(51.5074, -0.1278, 51.5074, -0.1278) = 0, 'no distance to yourself');
select test.assert_that(public.transport_cost_for(343.6) = 370, 'UK to France is about £370');
select test.assert_that(public.transport_cost_for(931.6) = 576, 'UK to Germany is about £576');
select test.assert_that(public.transport_cost_for(16993.9) = 6198, 'UK to Australia is about £6,200');
select test.assert_that(public.transit_time_for(343.6) = interval '1 hour', 'a short hop is one fishery day');
select test.assert_that(public.transit_time_for(931.6) = interval '2 hours', '932 km is two fishery days');
select test.assert_that(public.transit_time_for(16993.9) = interval '22 hours', 'Australia is 22 fishery days away');
select test.assert_that(public.condition_after_transport(90, 343.6) = 89, 'one point of stress per 200 km');
select test.assert_that(public.condition_after_transport(90, 16993.9) = 65, 'stress is capped at 25');
select test.assert_that(public.condition_after_transport(10, 16993.9) = 5, 'condition never falls below 5');

select test.assert_that(public.pounds_sterling(1500) = '£1,500' and public.pounds_sterling(25.5) = '£26', 'money reads like the UI');
select test.assert_that(public.pounds_and_ounces(20) = '20 lb' and public.pounds_and_ounces(20.5) = '20 lb 8 oz', 'weights read like the UI');
select test.assert_that(public.pounds_and_ounces(19.99) = '20 lb', 'sixteen ounces rounds up to the next pound');
