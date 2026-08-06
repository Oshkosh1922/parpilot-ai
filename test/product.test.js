import test from "node:test";
import assert from "node:assert/strict";
import { buildLaunchBlueprint } from "../src/engine/launch-engine.js";
import { buildGuestExperience } from "../src/engine/guest-engine.js";
import { estimateAnnualValue } from "../src/engine/roi-engine.js";
import { recommendFacilityPaths, buildOperatingActivationPlan } from "../src/engine/onboarding-engine.js";

test("launch blueprint produces financially grounded outputs",()=>{const r=buildLaunchBlueprint({monthlyFixedCosts:40000,averageCheck:25,contributionMarginRate:.68,openDays:25,availableCapital:200000});assert.equal(r.breakEvenGuests,95);assert.ok(r.viabilityScore>=28&&r.viabilityScore<=96);assert.ok(r.venture.facilityPaths.length>=4)});
test("facility recommendation adapts to constrained capital",()=>{const r=recommendFacilityPaths({availableCapital:45000,openingTimelineMonths:4,targetSeats:12,style:"Fast casual"});assert.ok(["pop_up","shared_kitchen"].includes(r[0].id))});
test("existing restaurant activation is phased and bounded",()=>{const r=buildOperatingActivationPlan({systems:["Square","QuickBooks","7shifts"],menuReady:true,invoicesReady:true,locations:1});assert.equal(r.phases.length,5);assert.ok(r.readiness>70);assert.ok(r.safeguards.includes("No hardware replacement"))});
test("guest engine activates recovery when promise is missed",()=>{const r=buildGuestExperience({quotedWait:15,currentWait:30,kitchenLoad:96});assert.equal(r.recovery.active,true);assert.equal(r.wait.status,"attention")});
test("ROI estimator preserves transparent component total",()=>{const r=estimateAnnualValue({annualSales:1000000});assert.equal(r.total,r.foodSavings+r.laborSavings+r.guestGrowth);assert.equal(r.total,36000)});
