import { handlePushTap } from './handlePushTap';

describe('handlePushTap', () => {
  it('routes to TaskDetail when the payload carries a taskId', () => {
    const nav = handlePushTap({ taskId: 'task-42' });
    expect(nav).toEqual({ screen: 'TaskDetail', params: { taskId: 'task-42' } });
  });

  it('falls back to Today when the payload is missing taskId', () => {
    expect(handlePushTap({})).toEqual({ screen: 'Today' });
  });

  it('falls back to Today when the payload is malformed', () => {
    expect(handlePushTap({ taskId: '' })).toEqual({ screen: 'Today' });
    expect(handlePushTap({ taskId: 123 as unknown as string })).toEqual({
      screen: 'Today',
    });
    expect(handlePushTap(null)).toEqual({ screen: 'Today' });
    expect(handlePushTap(undefined)).toEqual({ screen: 'Today' });
  });
});
