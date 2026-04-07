const toolService = require('../domain/toolService');
const Tool = require('../data-access/toolModel');

// Mock the Tool model methods used by the service
jest.mock('../data-access/toolModel', () => {
  return {
    paginate: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn()
  };
});

describe('ToolService - Upvote Persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return hasUpvoted: true if the requesting user has upvoted the tool in list view', async () => {
    // Mock paginate to return a fake tool with upvotes array containing the user ID
    Tool.paginate.mockResolvedValue({
      docs: [
        {
          _id: 'tool_1',
          name: 'Test Tool',
          upvotes: [{ user: 'user_789' }, { user: 'user_123' }, { user: 'user_456' }],
          toObject: function() { return this; }
        }
      ],
      totalDocs: 1,
      limit: 10,
      totalPages: 1,
      page: 1
    });

    const result = await toolService.getTools({}, 1, 10, false, 'user_123'); // requesting as user_123
    
    expect(result.tools.length).toBe(1);
    expect(result.tools[0].hasUpvoted).toBe(true);
    // Ensure the raw upvotes array is stripped (or ignored) to prevent leakage
    expect(result.tools[0].upvotes).toBeUndefined();
  });

  it('should return hasUpvoted: false if the requesting user has NOT upvoted the tool', async () => {
    Tool.paginate.mockResolvedValue({
      docs: [
        {
          _id: 'tool_2',
          name: 'Unvoted Tool',
          upvotes: [{ user: 'user_789' }, { user: 'user_456' }], // user_123 is missing
          toObject: function() { return this; }
        }
      ],
      totalDocs: 1,
      limit: 10,
      totalPages: 1,
      page: 1
    });

    const result = await toolService.getTools({}, 1, 10, false, 'user_123'); // requesting as user_123
    
    expect(result.tools.length).toBe(1);
    expect(result.tools[0].hasUpvoted).toBe(false);
  });
});
