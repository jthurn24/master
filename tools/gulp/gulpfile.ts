import {createPackageBuildTasks} from '../package-tools';
import {
  cdkExperimentalPackage,
  cdkPackage,
  googleMapsPackage,
  materialExperimentalPackage,
  materialPackage,
  momentAdapterPackage,
  youTubePlayerPackage
} from './packages';

// Build tasks have to be imported first, because the other tasks depend on them.
createPackageBuildTasks(cdkPackage);
createPackageBuildTasks(cdkExperimentalPackage);
createPackageBuildTasks(materialPackage);
createPackageBuildTasks(materialExperimentalPackage);
createPackageBuildTasks(momentAdapterPackage);
createPackageBuildTasks(youTubePlayerPackage);
createPackageBuildTasks(googleMapsPackage);

import './tasks/clean';
import './tasks/unit-test';
import './tasks/ci';
