// permissionsHelper.js
import { ability } from '../casl/ability';

// Define reusable permission keys based on your seed permissions
export const PERMISSIONS = {
  viewEvent: () => ability.can('view', 'Event'),
  addEvent: () => ability.can('add', 'Event'),
  deleteEvent: () => ability.can('delete', 'Event'),
  addTask: () => ability.can('add', 'Task'),
  ViewTask: () => ability.can('view', 'Task'),
  deleteTask: () => ability.can('delete', 'Task'),
  addBirthday: () => ability.can('add', 'Birthday'),
  ViewBirthday: () => ability.can('view', 'Birthday'),
  deleteBirthday: () => ability.can('delete', 'Birthday'),
  addImportantDay: () => ability.can('add', 'ImportantDay'),
  ViewImportantDay: () => ability.can('view', 'ImportantDay'),
  deleteImportantDay: () => ability.can('delete', 'ImportantDay'),
  addPressRelease: () => ability.can('add', 'PressRelease'),
  ViewPressRelease: () => ability.can('view', 'PressRelease'),
  deletePressRelease: () => ability.can('delete', 'PressRelease'),
  viewMedia: () => ability.can('view', 'Media'),
  addMedia: () => ability.can('add', 'Media'),
  deleteMedia: () => ability.can('delete', 'Media'),

  manageUser: () => ability.can('manage', 'User'),

  modifyPermission: () => ability.can('modify', 'Permission'),
};
