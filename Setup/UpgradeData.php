<?php
/**
 * Copyright (c) 2023 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

namespace HawkSearch\Proxy\Setup;

use HawkSearch\Proxy\Helper\Data;
use Magento\Catalog\Model\Category;
use Magento\Catalog\Setup\CategorySetupFactory;
use Magento\Framework\App\Cache\Type\Config;
use Magento\Framework\App\Config\ConfigResource\ConfigInterface;
use Magento\Framework\Serialize\Serializer\Json;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\ModuleDataSetupInterface;
use Magento\Framework\Setup\UpgradeDataInterface;

class UpgradeData implements UpgradeDataInterface
{
    /**
     * Category setup factory
     *
     * @var CategorySetupFactory
     */
    private $categorySetupFactory;

    /**
     * @var \Magento\Config\Model\ResourceModel\Config
     */
    private $config;

    /**
     * @var Config
     */
    private $cache;

    /**
     * @var Json
     */
    private $serializer;

    /**
     * @var Data
     */
    private $proxyHelper;

    /**
     * Init
     *
     * @param Json $serializer
     * @param CategorySetupFactory $categorySetupFactory
     * @param ConfigInterface $config
     * @param Config $cache
     * @param Data $proxyHelper
     */
    public function __construct(
        Json $serializer,
        CategorySetupFactory $categorySetupFactory,
        ConfigInterface $config,
        Config $cache,
        Data $proxyHelper
    )
    {
        $this->categorySetupFactory = $categorySetupFactory;
        $this->config = $config;
        $this->cache = $cache;
        $this->serializer = $serializer;
        $this->proxyHelper = $proxyHelper;
    }

    /**
     * {@inheritdoc}
     *
     * @SuppressWarnings(PHPMD.ExcessiveMethodLength)
     */
    public function upgrade(ModuleDataSetupInterface $setup, ModuleContextInterface $context)
    {
        $setup->startSetup();
        if (version_compare($context->getVersion(), '2.1.2', '<')) {
            $this->upgradeToLdgPage($setup);
        }
        if (version_compare($context->getVersion(), '2.2.0', '<')) {
            $this->upgradeConfigData($setup);
        }
        if (version_compare($context->getVersion(), '2.2.23', '<')) {
            $this->upgradeTextColor($setup);
        }
        $setup->endSetup();
    }

    /**
     * @param ModuleDataSetupInterface $setup
     */
    private function upgradeToLdgPage(ModuleDataSetupInterface $setup)
    {
        $categorySetup = $this->categorySetupFactory->create(['setup' => $setup]);
        $entityTypeId = $categorySetup->getEntityTypeId(Category::ENTITY);
        $attributeSetId = $categorySetup->getDefaultAttributeSetId($entityTypeId);
        $attribute = $categorySetup->getAttribute(Category::ENTITY, 'hawk_landing_page');
        if ($attribute) {
            $idg = $categorySetup->getAttributeGroupId($entityTypeId, $attributeSetId, 'Display Settings');
            $categorySetup->addAttributeToGroup(
                $entityTypeId,
                $attributeSetId,
                $idg,
                'hawk_landing_page',
                46
            );
            $categorySetup->updateAttribute(
                Category::ENTITY,
                'group',
                'hawk_landing_page',
                'Display Settings'
            );
        }
    }

    /**
     * @param ModuleDataSetupInterface $setup
     */
    private function upgradeConfigData(ModuleDataSetupInterface $setup)
    {
        /*
         * configuration changes
         * hawksearch_proxy/proxy/tracking_url_staging -> hawksearch_proxy/proxy/tracking_url_develop
         * hawksearch_proxy/proxy/tracking_url_live -> hawksearch_proxy/proxy/tracking_url_production
         * hawksearch_proxy/proxy/mode -> value "0" => "develop", value "1" => "production"
         */
        /**
         * @var \Magento\Config\Model\ResourceModel\Config $config
         */
        $config = $this->config;
        $select = $config->getConnection()
            ->select()
            ->from($setup->getTable('core_config_data'))
            ->where(
                'path in (?)',
                ['hawksearch_proxy/proxy/tracking_url_staging',
                    'hawksearch_proxy/proxy/tracking_url_live', 'hawksearch_proxy/proxy/mode']
            )
            ->order('path');
        foreach ($config->getConnection()->fetchAll($select) as $item) {
            if ($item['path'] == 'hawksearch_proxy/proxy/mode') {
                if ($item['value'] == "0") {
                    $item['value'] = 'develop';
                } else {
                    $item['value'] = 'production';
                }
            } elseif ($item['path'] == 'hawksearch_proxy/proxy/tracking_url_live') {
                $item['path'] = 'hawksearch_proxy/proxy/tracking_url_production';
            } elseif ($item['path'] == 'hawksearch_proxy/proxy/tracking_url_staging') {
                $item['path'] = 'hawksearch_proxy/proxy/tracking_url_develop';
            } else {
                continue;
            }
            $config->saveConfig($item['path'], $item['value'], $item['scope'], $item['scope_id']);
        }
        // delete old values:
        $config->deleteConfig('hawksearch_proxy/proxy/tracking_url_staging', 'default', 0);
        $config->deleteConfig('hawksearch_proxy/proxy/tracking_url_live', 'default', 0);
        $this->cache->clean();
    }

    /**
     * @param $setup
     */
    private function upgradeTextColor($setup)
    {
        /*
         * adding column 'textColor' to object
         */
        $select = $this->config->getConnection()
            ->select()
            ->from($setup->getTable('core_config_data'))
            ->where('path = ?', 'hawksearch_proxy/proxy/type_label')
            ->where('scope = ?', 'stores');
        foreach ($this->config->getConnection()->fetchAll($select) as $item) {
            $tabs = $this->serializer->unserialize($item['value']);
            foreach (array_keys($tabs) as $tab) {
                $tabs[$tab]['textColor'] = $this->proxyHelper->generateTextColor($tabs[$tab]['color']);
            }
            $this->config->saveConfig(
                $item['path'],
                $this->serializer->serialize($tabs),
                $item['scope'],
                $item['scope_id']
            );
        }
        $this->cache->clean();
    }
}
