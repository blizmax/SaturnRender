#pragma once
#include "graphics/basePass.h"
#include <array>
class RayTracingPass :public BasePass
{
public:
	RayTracingPass(vks::VulkanDevice * vulkanDevice);
	~RayTracingPass();
	void createFramebuffersAndRenderPass(uint32_t width, uint32_t  height);
	void createPipeline();
	void createDescriptorsLayouts();
	void wirteDescriptorSets(VkDescriptorPool &descriptorPool, std::vector<VkDescriptorImageInfo> &texDescriptor);
	void createUniformBuffers(VkQueue queue, glm::mat4 &invPerspective);
	void updateUniformBufferMatrices(glm::mat4 &invPerspective);
	void buildCommandBuffer(VkCommandBuffer& cmdBuffer);
private:
	struct RtFrameBuffer : public FrameBuffer {
		FrameBufferAttachment rtAttachment;
	};
	int ping = 1;
	struct UBOParams {
		glm::mat4 invProjection;
		glm::vec3 uWorldExtent;

	} uboParams;
	std::array <RtFrameBuffer,2> pingpong;

	vks::Buffer uniformBuffers;
};